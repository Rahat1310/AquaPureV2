import "server-only";

import { cookies } from "next/headers";
import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/prisma";

import type { CartLineItem, CartSummary, GuestCartItem } from "./types";

const CART_COOKIE = "aquapure_guest_cart";

function toNum(d: Decimal | null | undefined): number {
  return d ? parseFloat(d.toString()) : 0;
}

function parseImages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

// ─── DB Cart Query ────────────────────────────────────────────────────────────

export async function getDbCartSummary(userId: string): Promise<CartSummary> {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          images: true,
          price: true,
          stock: true,
          status: true,
        },
      },
      variant: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
        },
      },
    },
  });

  const items: CartLineItem[] = rows
    .filter((r) => r.product.status === "ACTIVE")
    .map((r) => {
      const price = r.variant ? toNum(r.variant.price) : toNum(r.product.price);
      const stock = r.variant ? r.variant.stock : r.product.stock;
      const images = parseImages(r.product.images);
      return {
        key: `${r.productId}:${r.variantId ?? ""}`,
        productId: r.productId,
        variantId: r.variantId,
        name: r.product.name,
        variantName: r.variant?.name ?? null,
        sku: r.variant?.sku ?? r.product.sku,
        image: images[0] ?? null,
        unitPrice: price,
        qty: r.qty,
        stock,
        subtotal: price * r.qty,
      };
    });

  return {
    items,
    totalQty: items.reduce((s, i) => s + i.qty, 0),
    subtotal: items.reduce((s, i) => s + i.subtotal, 0),
  };
}

// ─── Guest Cart Query ─────────────────────────────────────────────────────────

export async function getGuestCartSummary(): Promise<CartSummary> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return { items: [], totalQty: 0, subtotal: 0 };

  let guestItems: GuestCartItem[];
  try {
    guestItems = JSON.parse(raw) as GuestCartItem[];
  } catch {
    return { items: [], totalQty: 0, subtotal: 0 };
  }

  if (guestItems.length === 0) return { items: [], totalQty: 0, subtotal: 0 };

  const productIds = [...new Set(guestItems.map((g) => g.productId))];
  const variantIds = guestItems
    .map((g) => g.variantId)
    .filter((v): v is string => v !== null);

  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        sku: true,
        images: true,
        price: true,
        stock: true,
      },
    }),
    variantIds.length > 0
      ? prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: { id: true, name: true, sku: true, price: true, stock: true },
        })
      : Promise.resolve([]),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  const items: CartLineItem[] = [];
  for (const g of guestItems) {
    const product = productMap.get(g.productId);
    if (!product) continue;
    const variant = g.variantId ? variantMap.get(g.variantId) : null;

    const price = variant ? toNum(variant.price) : toNum(product.price);
    const stock = variant ? variant.stock : product.stock;
    const images = parseImages(product.images);

    items.push({
      key: `${g.productId}:${g.variantId ?? ""}`,
      productId: g.productId,
      variantId: g.variantId,
      name: product.name,
      variantName: variant?.name ?? null,
      sku: variant?.sku ?? product.sku,
      image: images[0] ?? null,
      unitPrice: price,
      qty: g.qty,
      stock,
      subtotal: price * g.qty,
    });
  }

  return {
    items,
    totalQty: items.reduce((s, i) => s + i.qty, 0),
    subtotal: items.reduce((s, i) => s + i.subtotal, 0),
  };
}

// ─── Unified Cart Summary (for Server Components) ─────────────────────────────

export async function getCartSummary(
  userId: string | null,
): Promise<CartSummary> {
  if (userId) return getDbCartSummary(userId);
  return getGuestCartSummary();
}

// ─── Cart Item Count ──────────────────────────────────────────────────────────

export async function getCartQty(userId: string | null): Promise<number> {
  if (userId) {
    const agg = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { qty: true },
    });
    return agg._sum.qty ?? 0;
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return 0;
  try {
    const items = JSON.parse(raw) as GuestCartItem[];
    return items.reduce((s, i) => s + i.qty, 0);
  } catch {
    return 0;
  }
}
