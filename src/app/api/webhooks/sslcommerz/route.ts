import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { logAudit } from "@/lib/audit-log";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { renderOrderConfirmationEmail } from "@/features/checkout/emails/OrderConfirmationEmail";
import { getOrderByTransactionRef } from "@/features/checkout/queries";
import type { OrderSummaryDTO } from "@/features/checkout/types";

/**
 * POST /api/webhooks/sslcommerz
 *
 * Handles SSLCommerz payment success/failure/cancel callbacks.
 *
 * Security:
 *  - Signature is verified using SSLCOMMERZ_WEBHOOK_SECRET env var.
 *  - Unknown / invalid signatures → 400.
 *
 * Idempotency:
 *  - Looks up Order by transactionRef (unique constraint).
 *  - If already PAID → returns 200 without double-processing.
 *
 * TODO (when implementing live gateway):
 *  1. Set SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD, SSLCOMMERZ_WEBHOOK_SECRET in .env
 *  2. Replace the stub signature check below with the real HMAC verification
 *     as documented at https://developer.sslcommerz.com/doc/v4/#verify-payment
 *  3. Implement the IPN validation call to SSLCommerz's verify endpoint.
 */
export async function POST(req: NextRequest) {
  // ── 1. Signature verification ──────────────────────────────────────────────
  const webhookSecret = process.env.SSLCOMMERZ_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[sslcommerz webhook] SSLCOMMERZ_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  // TODO: Replace this stub with real SSLCommerz signature verification.
  // Real implementation verifies `val_id` by calling SSLCommerz IPN validation API:
  //   GET https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
  //     ?val_id=<val_id>&store_id=<STORE_ID>&store_passwd=<STORE_PASSWORD>&format=json
  const rawBody = await req.text();

  const receivedSig = req.headers.get("x-ssl-signature") ?? "";
  const expectedSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  // In dev/testing we allow bypass when SSLCOMMERZ_SKIP_SIG=1 is set
  const skipSig = process.env.SSLCOMMERZ_SKIP_SIG === "1";
  if (!skipSig && receivedSig !== expectedSig) {
    console.warn("[sslcommerz webhook] Invalid signature.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // ── 2. Parse payload ───────────────────────────────────────────────────────
  let payload: Record<string, string>;
  try {
    payload = Object.fromEntries(new URLSearchParams(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { status, tran_id: transactionRef } = payload;

  if (!transactionRef) {
    return NextResponse.json({ error: "Missing tran_id." }, { status: 400 });
  }

  // ── 3. Only process VALID (successful) payments ───────────────────────────
  if (status !== "VALID") {
    // Failed or cancelled — log and return OK to prevent SSLCommerz retries
    console.info(`[sslcommerz webhook] Non-VALID status received: ${status} for tran_id ${transactionRef}`);
    return NextResponse.json({ received: true });
  }

  // ── 4. Look up order ───────────────────────────────────────────────────────
  const orderRef = await getOrderByTransactionRef(transactionRef);

  if (!orderRef) {
    console.error(`[sslcommerz webhook] No order found for tran_id: ${transactionRef}`);
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // ── 5. Idempotency: skip if already PAID ──────────────────────────────────
  if (orderRef.status === "PAID") {
    console.info(`[sslcommerz webhook] Order ${orderRef.id} already PAID — skipping.`);
    return NextResponse.json({ received: true });
  }

  // ── 6. Transition to PAID ─────────────────────────────────────────────────
  const before = { status: orderRef.status };

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

  // ── 7. Audit log ───────────────────────────────────────────────────────────
  await logAudit({
    userId: orderRef.userId,
    action: "WEBHOOK_ORDER_PAID",
    entityType: "Order",
    entityId: orderRef.id,
    before,
    after: { status: "PAID", paidAt: new Date().toISOString(), transactionRef },
  });

  // ── 8. Send confirmation email (non-blocking) ──────────────────────────────
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
      paymentMethod: (updatedOrder.paymentMethod ?? null) as OrderSummaryDTO["paymentMethod"],
      deliveryOption: (updatedOrder.deliveryOption ?? null) as OrderSummaryDTO["deliveryOption"],
      installationOption: (updatedOrder.installationOption ?? null) as OrderSummaryDTO["installationOption"],
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
      subject: `Payment Confirmed — ${updatedOrder.orderNumber} 🎉`,
      html: renderOrderConfirmationEmail(orderSummary),
    }).catch(() => undefined);
  }

  return NextResponse.json({ received: true });
}
