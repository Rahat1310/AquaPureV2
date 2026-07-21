/**
 * Order Confirmation Email — plain HTML template (no external dependencies).
 *
 * We use a simple function-based template instead of react-email to avoid
 * adding another package. The output is valid email HTML.
 */

import type { OrderSummaryDTO } from "@/features/checkout/types";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

export function renderOrderConfirmationEmail(order: OrderSummaryDTO): string {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5eaf5;font-size:14px;color:#1e293b;">
          <strong>${item.name}</strong>${item.variantName ? ` <span style="color:#64748b;font-size:12px;">(${item.variantName})</span>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e5eaf5;font-size:14px;color:#64748b;text-align:center;">×${item.qty}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e5eaf5;font-size:14px;color:#1b4fd1;text-align:right;font-weight:700;">
          ${BDT.format(item.total)}
        </td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Order Confirmation — Padma Mineral Water</title>
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(27,79,209,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1b4fd1 0%,#0ea5e9 100%);padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="background:rgba(255,255,255,0.15);border-radius:14px;padding:10px;">
                  <svg width="28" height="34" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1.5S2.5 15.2 2.5 25.1C2.5 32.2 8.5 37 16 37s13.5-4.8 13.5-11.9C29.5 15.2 16 1.5 16 1.5Z" fill="white"/>
                    <path d="M9.8 27.4c2.3 3.2 7 4.2 11.4 1.5" stroke="#75D6FF" stroke-width="2.4" stroke-linecap="round"/>
                  </svg>
                </div>
                <span style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.04em;">PMW</span>
              </div>
              <h1 style="margin:20px 0 8px;font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.03em;">Order Confirmed! 🎉</h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);">Thank you for your order. We're getting it ready!</p>
            </td>
          </tr>

          <!-- Order number -->
          <tr>
            <td style="padding:32px 40px 0;">
              <div style="background:#f0f4ff;border-radius:14px;padding:16px 20px;text-align:center;">
                <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#1b4fd1;">Order Number</p>
                <p style="margin:6px 0 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.02em;">${order.orderNumber}</p>
              </div>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:28px 40px 0;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;">Items Ordered</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;text-align:left;padding-bottom:8px;">Product</th>
                    <th style="font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;text-align:center;padding-bottom:8px;">Qty</th>
                    <th style="font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;text-align:right;padding-bottom:8px;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:20px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;color:#64748b;padding:4px 0;">Subtotal</td>
                  <td style="font-size:14px;color:#1e293b;font-weight:600;text-align:right;padding:4px 0;">${BDT.format(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#64748b;padding:4px 0;">Shipping</td>
                  <td style="font-size:14px;color:#1e293b;font-weight:600;text-align:right;padding:4px 0;">${BDT.format(order.shipping)}</td>
                </tr>
                <tr>
                  <td style="font-size:16px;color:#0f172a;font-weight:900;padding:12px 0 0;border-top:2px solid #e5eaf5;">Total</td>
                  <td style="font-size:16px;color:#1b4fd1;font-weight:900;text-align:right;padding:12px 0 0;border-top:2px solid #e5eaf5;">${BDT.format(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery -->
          ${order.deliveryOption ? `
          <tr>
            <td style="padding:24px 40px 0;">
              <div style="background:#f0fdf4;border-radius:12px;padding:14px 18px;">
                <p style="margin:0;font-size:13px;color:#166534;font-weight:600;">🚚 Delivery: ${order.deliveryOption === "EXPRESS" ? "Express (1–2 days)" : "Standard (3–5 days)"}</p>
                ${order.installationOption === "SCHEDULED" ? '<p style="margin:6px 0 0;font-size:13px;color:#166534;">🔧 Professional installation scheduled</p>' : ""}
              </div>
            </td>
          </tr>` : ""}

          <!-- CTA -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://padmamineralwater.com"}/orders/${order.id}"
                style="display:inline-block;background:linear-gradient(135deg,#1b4fd1,#0ea5e9);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;letter-spacing:-0.01em;">
                Track Your Order →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 40px;text-align:center;border-top:1px solid #e5eaf5;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Questions? Email us at <a href="mailto:care@padmamineralwater.com" style="color:#1b4fd1;">care@padmamineralwater.com</a></p>
              <p style="margin:8px 0 0;font-size:12px;color:#cbd5e1;">Padma Mineral Water — Safe water. Safe life.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
