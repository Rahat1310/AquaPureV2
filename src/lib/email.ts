/**
 * Minimal email abstraction.
 *
 * Priority:
 *  1. Resend (RESEND_API_KEY set)
 *  2. Console log (development / no config)
 *
 * Usage:
 *   await sendEmail({
 *     to: "user@example.com",
 *     subject: "Your order",
 *     html: "<p>Thanks!</p>",
 *   });
 */

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const from = payload.from ?? (process.env.EMAIL_FROM ?? "AquaPure <noreply@aquapure.com>");
  const to = Array.isArray(payload.to) ? payload.to : [payload.to];

  // ── Resend ──────────────────────────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[sendEmail] Resend error:", response.status, body);
      // Don't throw — email is best-effort; never break the order flow
    }
    return;
  }

  // ── Development fallback: log to console ──────────────────────────────────
  console.info(
    `[sendEmail] (dev/no-provider) To: ${to.join(", ")} | Subject: ${payload.subject}`,
  );
  if (process.env.NODE_ENV !== "production") {
    console.debug("[sendEmail] HTML preview:\n", payload.html.slice(0, 500));
  }
}
