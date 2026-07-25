"use server";

import { randomUUID } from "crypto";
import { after } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/auth";
import { clearCart } from "@/features/cart/actions";
import { getCartSummary } from "@/features/cart/queries";
import { renderOrderConfirmationEmail } from "@/features/checkout/emails/OrderConfirmationEmail";
import {
  cancelUserOrder,
  createOrderRecord,
  getUserOrderDetail,
} from "@/features/checkout/order-repository";
import {
  BKASH_DELIVERY_CHARGE,
  COD_DELIVERY_CHARGE,
  createOrderSchema,
} from "@/features/checkout/schema";
import type { CreateOrderResult } from "@/features/checkout/types";
import { logAudit } from "@/lib/audit-log";
import { AppDbError, toUserFacingDbError } from "@/lib/db-errors";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { checkoutRatelimit, enforceRateLimit } from "@/lib/ratelimit";

function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `PMW-${ymd}-${rand}`;
}

function zodFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key =
      issue.path.map((p) => String(p)).join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Place order (Clerk-gated Server Action).
 * Persists via `createOrderRecord` inside a Prisma `$transaction`
 * (stock decrement + order + items are atomic).
 */
export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be logged in to place an order." };
  }

  const userId = session.user.id;

  // Rate limit before any Prisma writes (userId + IP)
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";
  const limit = await enforceRateLimit(
    checkoutRatelimit,
    `checkout:${userId}:${ip}`,
  );
  if (!limit.success) {
    return {
      ok: false,
      error: "Too many checkout requests. Please try again in a minute.",
    };
  }

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error.issues);
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid order data.",
      fieldErrors,
    };
  }

  const {
    address,
    deliveryOption,
    installationOption,
    paymentMethod,
    bkashSenderNumber,
    bkashTrxId,
    notes,
  } = parsed.data;

  try {
    const cart = await getCartSummary(userId);
    if (cart.items.length === 0) {
      return { ok: false, error: "Your cart is empty." };
    }

    const shipping =
      paymentMethod === "COD" ? COD_DELIVERY_CHARGE : BKASH_DELIVERY_CHARGE;
    const tax = 0;
    const total = cart.subtotal + shipping + tax;

    const order = await createOrderRecord({
      userId,
      orderNumber: generateOrderNumber(),
      transactionRef: randomUUID(),
      address,
      deliveryOption,
      installationOption,
      paymentMethod,
      bkashSenderNumber,
      bkashTrxId,
      notes,
      subtotal: cart.subtotal,
      shipping,
      tax,
      total,
      items: cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    });

    await clearCart(userId);

    after(async () => {
      try {
        await logAudit({
          userId,
          action: "CREATE_ORDER",
          entityType: "Order",
          entityId: order.id,
          after: {
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            total: order.total.toString(),
            paymentMethod: order.paymentMethod,
          },
        });

        const [userRecord, orderSummary] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
          }),
          getUserOrderDetail(order.id, userId),
        ]);

        if (userRecord?.email && orderSummary) {
          await sendEmail({
            to: userRecord.email,
            subject: `Order ${order.orderNumber} — Confirmed`,
            html: renderOrderConfirmationEmail(orderSummary),
          });
        }
      } catch {
        /* side effects must not fail the placed order */
      }
    });

    return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (err) {
    const mapped = toUserFacingDbError(err);
    return { ok: false, error: mapped.message };
  }
}

export async function cancelOrder(
  orderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated." };
  }

  const userId = session.user.id;

  try {
    const result = await cancelUserOrder(orderId, userId);

    after(async () => {
      try {
        await logAudit({
          userId,
          action: "CANCEL_ORDER",
          entityType: "Order",
          entityId: result.id,
          before: { status: result.previousStatus },
          after: { status: "CANCELLED" },
        });
      } catch {
        /* ignore */
      }
    });

    return { ok: true };
  } catch (err) {
    const mapped =
      err instanceof AppDbError ? err : toUserFacingDbError(err);
    return { ok: false, error: mapped.message };
  }
}
