"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { auth } from "@/auth";
import { logAudit } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";

import {
  addToCartSchema,
  removeFromCartSchema,
  updateQuantitySchema,
  type AddToCartInput,
  type CartActionResult,
  type RemoveFromCartInput,
  type UpdateQuantityInput,
} from "./schema";
import type { GuestCartItem } from "./types";

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const CART_COOKIE = "aquapure_guest_cart";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function readGuestCart(): Promise<GuestCartItem[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as GuestCartItem[];
  } catch {
    return [];
  }
}

async function writeGuestCart(items: GuestCartItem[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

async function clearGuestCart(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}

// ─── Stock helpers ────────────────────────────────────────────────────────────

/**
 * Returns available stock for the given product/variant.
 * Returns 0 if product doesn't exist or is not ACTIVE.
 */
async function checkStock(
  productId: string,
  variantId: string | null | undefined,
): Promise<number> {
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true, product: { select: { status: true } } },
    });
    if (!variant || variant.product.status !== "ACTIVE") return 0;
    return variant.stock;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true, status: true },
  });
  if (!product || product.status !== "ACTIVE") return 0;
  return product.stock;
}

// ─── Line key ─────────────────────────────────────────────────────────────────

function lineKey(productId: string, variantId?: string | null) {
  return `${productId}:${variantId ?? ""}`;
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────

export async function addToCart(
  input: unknown,
): Promise<CartActionResult> {
  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { productId, variantId = null, qty } = parsed.data;

  // Server-side stock check
  const available = await checkStock(productId, variantId);
  if (available < 1) {
    return { ok: false, error: "This item is out of stock." };
  }

  const session = await auth();

  if (session?.user?.id) {
    // ── Logged-in: write to DB ─────────────────────────────────────────────
    const userId = session.user.id;

    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId, variantId: variantId ?? null },
    });

    const newQty = Math.min((existing?.qty ?? 0) + qty, available);

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { userId, productId, variantId: variantId ?? null, qty: newQty },
      });
    }

    const totalQty = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { qty: true },
    });

    revalidatePath("/", "layout");
    return { ok: true, totalQty: totalQty._sum.qty ?? 0 };
  } else {
    // ── Guest: write to cookie ─────────────────────────────────────────────
    const items = await readGuestCart();
    const key = lineKey(productId, variantId);
    const idx = items.findIndex((i) => lineKey(i.productId, i.variantId) === key);

    if (idx >= 0) {
      items[idx].qty = Math.min(items[idx].qty + qty, available);
    } else {
      items.push({ productId, variantId: variantId ?? null, qty });
    }

    await writeGuestCart(items);
    const totalQty = items.reduce((s, i) => s + i.qty, 0);
    revalidatePath("/", "layout");
    return { ok: true, totalQty };
  }
}

// ─── Update Quantity ──────────────────────────────────────────────────────────

export async function updateQuantity(
  input: unknown,
): Promise<CartActionResult> {
  const parsed = updateQuantitySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { productId, variantId = null, qty } = parsed.data;

  // If qty === 0 treat as remove
  if (qty === 0) return removeFromCart({ productId, variantId });

  // Server-side stock re-check
  const available = await checkStock(productId, variantId);
  if (available < 1) {
    return { ok: false, error: "This item is out of stock." };
  }
  const safeQty = Math.min(qty, available);

  const session = await auth();

  if (session?.user?.id) {
    const userId = session.user.id;
    await prisma.cartItem.updateMany({
      where: { userId, productId, variantId: variantId ?? null },
      data: { qty: safeQty },
    });

    const totalQty = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { qty: true },
    });

    revalidatePath("/", "layout");
    return { ok: true, totalQty: totalQty._sum.qty ?? 0 };
  } else {
    const items = await readGuestCart();
    const key = lineKey(productId, variantId);
    const idx = items.findIndex((i) => lineKey(i.productId, i.variantId) === key);
    if (idx >= 0) items[idx].qty = safeQty;
    await writeGuestCart(items);
    const totalQty = items.reduce((s, i) => s + i.qty, 0);
    revalidatePath("/", "layout");
    return { ok: true, totalQty };
  }
}

// ─── Remove from Cart ─────────────────────────────────────────────────────────

export async function removeFromCart(
  input: unknown,
): Promise<CartActionResult> {
  const parsed = removeFromCartSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { productId, variantId = null } = parsed.data as RemoveFromCartInput;

  const session = await auth();

  if (session?.user?.id) {
    const userId = session.user.id;
    await prisma.cartItem.deleteMany({
      where: { userId, productId, variantId: variantId ?? null },
    });

    const totalQty = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { qty: true },
    });

    revalidatePath("/", "layout");
    return { ok: true, totalQty: totalQty._sum.qty ?? 0 };
  } else {
    const items = await readGuestCart();
    const key = lineKey(productId, variantId);
    const filtered = items.filter(
      (i) => lineKey(i.productId, i.variantId) !== key,
    );
    await writeGuestCart(filtered);
    const totalQty = filtered.reduce((s, i) => s + i.qty, 0);
    revalidatePath("/", "layout");
    return { ok: true, totalQty };
  }
}

// ─── Merge Guest Cart on Login ────────────────────────────────────────────────

/**
 * Called in auth.ts after a successful sign-in.
 * Merges guest cookie cart items into the user's DB cart.
 * Uses upsert to safely combine quantities without exceeding stock.
 */
export async function mergeGuestCart(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return;

  let guestItems: GuestCartItem[];
  try {
    guestItems = JSON.parse(raw) as GuestCartItem[];
  } catch {
    return;
  }

  if (guestItems.length === 0) return;

  for (const guest of guestItems) {
    try {
      const available = await checkStock(guest.productId, guest.variantId);
      if (available < 1) continue;

      const existing = await prisma.cartItem.findFirst({
        where: {
          userId,
          productId: guest.productId,
          variantId: guest.variantId ?? null,
        },
      });

      const mergedQty = Math.min(
        (existing?.qty ?? 0) + guest.qty,
        available,
      );

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { qty: mergedQty },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId,
            productId: guest.productId,
            variantId: guest.variantId ?? null,
            qty: mergedQty,
          },
        });
      }

      await logAudit({
        userId,
        action: "MERGE_GUEST_CART",
        entityType: "CartItem",
        entityId: `${guest.productId}:${guest.variantId ?? ""}`,
        after: { qty: mergedQty },
      });
    } catch {
      // Non-fatal: skip problematic items silently
    }
  }

  cookieStore.delete(CART_COOKIE);
}

// ─── Get Guest Cart Total Qty (for Server Components) ────────────────────────

export async function getGuestCartQty(): Promise<number> {
  const items = await readGuestCart();
  return items.reduce((s, i) => s + i.qty, 0);
}

// ─── Clear Cart (after order placed) ─────────────────────────────────────────

export async function clearCart(userId: string): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { userId } });
  await clearGuestCart();
}
