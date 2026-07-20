"use server";

import { randomUUID } from "crypto";

import { auth } from "@/auth";
import { clearCart } from "@/features/cart/actions";
import { getCartSummary } from "@/features/cart/queries";
import { renderOrderConfirmationEmail } from "@/features/checkout/emails/OrderConfirmationEmail";
import { logAudit } from "@/lib/audit-log";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

import { createOrderSchema } from "./schema";
import type { CreateOrderResult, OrderSummaryDTO } from "./types";

// ─── Shipping fee schedule ─────────────────────────────────────────────────────

const SHIPPING_RATES: Record<string, number> = {
  STANDARD: 0,    // Free standard delivery
  EXPRESS: 299,   // BDT 299 for express
};

// ─── Order number generator ───────────────────────────────────────────────────

function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `AQ-${ymd}-${rand}`;
}

// ─── Create Order ─────────────────────────────────────────────────────────────

/**
 * Creates an Order in PENDING status after validating cart + stock server-side.
 *
 * - Requires authenticated session (CUSTOMER role enforced).
 * - Validates input with Zod.
 * - Re-checks stock for every cart item inside a DB transaction.
 * - Sets a unique transactionRef (UUID) for idempotent webhook handling.
 * - Calls logAudit() after creation.
 * - Sends order confirmation email non-blocking.
 */
export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be logged in to place an order." };
  }

  const userId = session.user.id;

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid order data.",
    };
  }

  const { address, deliveryOption, installationOption, paymentMethod, notes } =
    parsed.data;

  // ── Load cart ──────────────────────────────────────────────────────────────
  const cart = await getCartSummary(userId);
  if (cart.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const shipping = SHIPPING_RATES[deliveryOption] ?? 0;
  const tax = 0; // VAT can be added later
  const total = cart.subtotal + shipping + tax;
  const transactionRef = randomUUID();
  const orderNumber = generateOrderNumber();

  // ── DB Transaction: stock re-check + order creation ───────────────────────
  try {
    const order = await prisma.$transaction(async (tx) => {
      // Re-check stock for every item
      for (const item of cart.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true },
          });
          if (!variant || variant.stock < item.qty) {
            throw new Error(
              `"${item.name}" (${item.variantName ?? item.variantId}) does not have enough stock. Available: ${variant?.stock ?? 0}, Requested: ${item.qty}`,
            );
          }
        } else {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true },
          });
          if (!product || product.stock < item.qty) {
            throw new Error(
              `"${item.name}" does not have enough stock. Available: ${product?.stock ?? 0}, Requested: ${item.qty}`,
            );
          }
        }
      }

      // Create Address record
      const addressRecord = await tx.address.create({
        data: {
          userId,
          label: "Order Address",
          recipientName: address.recipientName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2 || null,
          city: address.city,
          district: address.district,
          postCode: address.postCode || null,
        },
      });

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: addressRecord.id,
          status: "PENDING",
          subtotal: cart.subtotal,
          shipping,
          tax,
          total,
          deliveryOption,
          installationOption,
          paymentMethod,
          notes: notes || null,
          transactionRef,
          orderItems: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              qty: item.qty,
              unitPrice: item.unitPrice,
              total: item.subtotal,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: { select: { name: true, sku: true } },
              variant: { select: { name: true, sku: true } },
            },
          },
          address: true,
        },
      });

      return newOrder;
    });

    // ── Audit log ──────────────────────────────────────────────────────────
    await logAudit({
      userId,
      action: "CREATE_ORDER",
      entityType: "Order",
      entityId: order.id,
      after: {
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total.toString(),
        paymentMethod,
        deliveryOption,
      },
    });

    // ── Clear cart ─────────────────────────────────────────────────────────
    await clearCart(userId);

    // ── Send confirmation email (non-blocking) ────────────────────────────
    const orderSummary: OrderSummaryDTO = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status as OrderSummaryDTO["status"],
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      paymentMethod: order.paymentMethod as OrderSummaryDTO["paymentMethod"],
      deliveryOption: order.deliveryOption as OrderSummaryDTO["deliveryOption"],
      installationOption: order.installationOption as OrderSummaryDTO["installationOption"],
      paidAt: null,
      createdAt: order.createdAt.toISOString(),
      address: order.address
        ? {
            recipientName: order.address.recipientName,
            phone: order.address.phone,
            line1: order.address.line1,
            line2: order.address.line2 ?? undefined,
            city: order.address.city,
            district: order.address.district,
            postCode: order.address.postCode ?? undefined,
          }
        : null,
      items: order.orderItems.map((oi) => ({
        id: oi.id,
        name: oi.product.name,
        variantName: oi.variant?.name ?? null,
        sku: oi.variant?.sku ?? oi.product.sku,
        qty: oi.qty,
        unitPrice: Number(oi.unitPrice),
        total: Number(oi.total),
      })),
    };

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (userRecord?.email) {
      sendEmail({
        to: userRecord.email,
        subject: `Order ${order.orderNumber} — Confirmed! 🎉`,
        html: renderOrderConfirmationEmail(orderSummary),
      }).catch(() => undefined); // Non-blocking; intentionally swallowed
    }

    return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Order creation failed. Please try again.";
    return { ok: false, error: message };
  }
}

// ─── Cancel Order ─────────────────────────────────────────────────────────────

export async function cancelOrder(
  orderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated." };
  }

  const userId = session.user.id;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true, status: true, orderNumber: true, total: true },
  });

  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "PAID" || order.status === "SHIPPED") {
    return { ok: false, error: "This order cannot be cancelled." };
  }

  const before = { status: order.status };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  await logAudit({
    userId,
    action: "CANCEL_ORDER",
    entityType: "Order",
    entityId: orderId,
    before,
    after: { status: "CANCELLED" },
  });

  return { ok: true };
}
