"use server";

import { randomUUID } from "crypto";

import { auth } from "@/auth";
import { clearCart } from "@/features/cart/actions";
import { getCartSummary } from "@/features/cart/queries";
import { renderOrderConfirmationEmail } from "@/features/checkout/emails/OrderConfirmationEmail";
import {
  BKASH_DELIVERY_CHARGE,
  COD_DELIVERY_CHARGE,
  createOrderSchema,
} from "@/features/checkout/schema";
import type { CreateOrderResult, OrderSummaryDTO } from "@/features/checkout/types";
import { logAudit } from "@/lib/audit-log";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `PMW-${ymd}-${rand}`;
}

/**
 * Place order after Clerk auth. COD → 100 BDT delivery + payment Pending.
 * bKash → 0 delivery, store sender + TrxID, payment Pending until verified.
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

  const {
    address,
    deliveryOption,
    installationOption,
    paymentMethod,
    bkashSenderNumber,
    bkashTrxId,
    notes,
  } = parsed.data;

  const cart = await getCartSummary(userId);
  if (cart.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const shipping =
    paymentMethod === "COD" ? COD_DELIVERY_CHARGE : BKASH_DELIVERY_CHARGE;
  const tax = 0;
  const total = cart.subtotal + shipping + tax;
  const transactionRef = randomUUID();
  const orderNumber = generateOrderNumber();

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true },
          });
          if (!variant || variant.stock < item.qty) {
            throw new Error(
              `"${item.name}" does not have enough stock. Available: ${variant?.stock ?? 0}`,
            );
          }
        } else {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true },
          });
          if (!product || product.stock < item.qty) {
            throw new Error(
              `"${item.name}" does not have enough stock. Available: ${product?.stock ?? 0}`,
            );
          }
        }
      }

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

      return tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: addressRecord.id,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal: cart.subtotal,
          shipping,
          tax,
          total,
          deliveryOption,
          installationOption,
          paymentMethod,
          bkashSenderNumber:
            paymentMethod === "BKASH" ? bkashSenderNumber?.trim() || null : null,
          bkashTrxId: paymentMethod === "BKASH" ? bkashTrxId?.trim() || null : null,
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
    });

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
        paymentMethod,
      },
    });

    await clearCart(userId);

    const orderSummary: OrderSummaryDTO = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status as OrderSummaryDTO["status"],
      paymentStatus: (order.paymentStatus ?? "PENDING") as OrderSummaryDTO["paymentStatus"],
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      paymentMethod: order.paymentMethod as OrderSummaryDTO["paymentMethod"],
      deliveryOption: order.deliveryOption as OrderSummaryDTO["deliveryOption"],
      installationOption:
        order.installationOption as OrderSummaryDTO["installationOption"],
      bkashSenderNumber: order.bkashSenderNumber,
      bkashTrxId: order.bkashTrxId,
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
        subject: `Order ${order.orderNumber} — Confirmed`,
        html: renderOrderConfirmationEmail(orderSummary),
      }).catch(() => undefined);
    }

    return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Order creation failed. Please try again.";
    return { ok: false, error: message };
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

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true, status: true, orderNumber: true, total: true },
  });

  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED") {
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
