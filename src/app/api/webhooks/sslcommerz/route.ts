import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { renderOrderConfirmationEmail } from "@/features/checkout/emails/OrderConfirmationEmail";
import { getOrderByTransactionRef } from "@/features/checkout/queries";
import type { OrderSummaryDTO } from "@/features/checkout/types";
import { logAudit } from "@/lib/audit-log";
import {
  apiError,
  apiOk,
  corsPreflightDenied,
  parseOrError,
  withApiHandler,
} from "@/lib/api-route";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * SSLCommerz IPN / webhook — server-to-server.
 * Auth = HMAC signature (not browser CORS / Clerk).
 * Never sets Access-Control-Allow-Origin.
 */

const webhookPayloadSchema = z.object({
  status: z.string().trim().max(40),
  tran_id: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid tran_id."),
  val_id: z.string().trim().max(120).optional(),
  amount: z.string().trim().max(40).optional(),
  currency: z.string().trim().max(10).optional(),
});

export async function OPTIONS() {
  return corsPreflightDenied();
}

export async function POST(req: NextRequest) {
  return withApiHandler("webhooks/sslcommerz", async () => {
    const webhookSecret = process.env.SSLCOMMERZ_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[sslcommerz] SSLCOMMERZ_WEBHOOK_SECRET is not configured.");
      return apiError("Webhook not configured.", 503);
    }

    const rawBody = await req.text();
    if (rawBody.length > 32_000) {
      console.warn("[sslcommerz] payload too large");
      return apiError("Invalid request.", 400);
    }

    const receivedSig = req.headers.get("x-ssl-signature") ?? "";
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const skipSig = process.env.SSLCOMMERZ_SKIP_SIG === "1";
    if (!skipSig && receivedSig !== expectedSig) {
      console.warn("[sslcommerz] Invalid signature.");
      return apiError("Invalid signature.", 400);
    }

    let entries: Record<string, string>;
    try {
      entries = Object.fromEntries(new URLSearchParams(rawBody));
    } catch {
      console.warn("[sslcommerz] Failed to parse body");
      return apiError("Invalid request.", 400);
    }

    const parsed = parseOrError(
      webhookPayloadSchema,
      entries,
      "webhooks/sslcommerz",
    );
    if ("response" in parsed) return parsed.response;

    const { status, tran_id: transactionRef } = parsed.data;

    if (status !== "VALID") {
      console.info("[sslcommerz] Non-VALID status", { status, transactionRef });
      return apiOk({ received: true });
    }

    const orderRef = await getOrderByTransactionRef(transactionRef);
    if (!orderRef) {
      console.error("[sslcommerz] No order for tran_id", { transactionRef });
      // Generic response — do not confirm existence patterns to scanners
      return apiError("Invalid request.", 400);
    }

    if (orderRef.status === "PAID") {
      console.info("[sslcommerz] Already PAID", { orderId: orderRef.id });
      return apiOk({ received: true });
    }

    const before = { status: orderRef.status };

    // Prisma parameterized update by id (never concatenate user input into SQL)
    const updatedOrder = await prisma.order.update({
      where: { id: orderRef.id },
      data: { status: "PAID", paymentStatus: "PAID", paidAt: new Date() },
      include: {
        orderItems: {
          include: {
            product: { select: { name: true, sku: true } },
            variant: { select: { name: true, sku: true } },
          },
        },
        address: true,
        user: { select: { email: true, name: true } },
      },
    });

    await logAudit({
      userId: orderRef.userId,
      action: "WEBHOOK_ORDER_PAID",
      entityType: "Order",
      entityId: orderRef.id,
      before,
      after: {
        status: "PAID",
        paidAt: new Date().toISOString(),
        transactionRef,
      },
    });

    if (updatedOrder.user?.email) {
      const orderSummary: OrderSummaryDTO = {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: "PAID",
        paymentStatus: "PAID",
        subtotal: Number(updatedOrder.subtotal),
        shipping: Number(updatedOrder.shipping),
        tax: Number(updatedOrder.tax),
        total: Number(updatedOrder.total),
        paymentMethod:
          (updatedOrder.paymentMethod ??
            null) as OrderSummaryDTO["paymentMethod"],
        deliveryOption:
          (updatedOrder.deliveryOption ??
            null) as OrderSummaryDTO["deliveryOption"],
        installationOption:
          (updatedOrder.installationOption ??
            null) as OrderSummaryDTO["installationOption"],
        bkashSenderNumber: updatedOrder.bkashSenderNumber ?? null,
        bkashTrxId: updatedOrder.bkashTrxId ?? null,
        paidAt: updatedOrder.paidAt?.toISOString() ?? null,
        createdAt: updatedOrder.createdAt.toISOString(),
        address: updatedOrder.address
          ? {
              recipientName: updatedOrder.address.recipientName,
              phone: updatedOrder.address.phone,
              line1: updatedOrder.address.line1,
              line2: updatedOrder.address.line2 ?? undefined,
              city: updatedOrder.address.city,
              district: updatedOrder.address.district,
              postCode: updatedOrder.address.postCode ?? undefined,
            }
          : null,
        items: updatedOrder.orderItems.map((oi) => ({
          id: oi.id,
          name: oi.product.name,
          variantName: oi.variant?.name ?? null,
          sku: oi.variant?.sku ?? oi.product.sku,
          qty: oi.qty,
          unitPrice: Number(oi.unitPrice),
          total: Number(oi.total),
        })),
      };

      sendEmail({
        to: updatedOrder.user.email,
        subject: `Payment Confirmed — ${updatedOrder.orderNumber}`,
        html: renderOrderConfirmationEmail(orderSummary),
      }).catch((err) => {
        console.error("[sslcommerz] email failed", err);
      });
    }

    return apiOk({ received: true });
  });
}
