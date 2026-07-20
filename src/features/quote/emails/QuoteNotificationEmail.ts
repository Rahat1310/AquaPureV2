/**
 * Internal notification email sent to sales staff when a new QuoteRequest arrives.
 */

interface QuoteNotificationData {
  id: string;
  name: string;
  company?: string | null;
  phone: string;
  email?: string | null;
  requirement: string;
  capacityNeeded?: string | null;
  createdAt: string;
}

export function renderQuoteNotificationEmail(quote: QuoteNotificationData): string {
  const rows = [
    ["Name", quote.name],
    ["Company", quote.company ?? "—"],
    ["Phone", quote.phone],
    ["Email", quote.email ?? "—"],
    ["Capacity Needed", quote.capacityNeeded ?? "—"],
    ["Submitted", quote.createdAt],
  ]
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#475569;background:#f8faff;border-bottom:1px solid #e5eaf5;white-space:nowrap;">${label}</td>
        <td style="padding:8px 12px;font-size:13px;color:#1e293b;border-bottom:1px solid #e5eaf5;">${value}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New Quote Request — AquaPure</title></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 20px;background:#f0f4ff;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(27,79,209,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#1b4fd1,#0ea5e9);padding:28px 32px;">
              <h1 style="margin:0;font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.03em;">🧾 New Quote Request</h1>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">A customer has submitted a consultation request on AquaPure.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5eaf5;border-radius:10px;overflow:hidden;">
                ${rows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#475569;">Requirement:</p>
              <div style="background:#f8faff;border-left:4px solid #1b4fd1;padding:12px 16px;border-radius:0 10px 10px 0;font-size:14px;color:#1e293b;line-height:1.6;">
                ${quote.requirement.replace(/\n/g, "<br/>")}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://aquapure.com"}/admin/quotes/${quote.id}"
                style="display:inline-block;background:#1b4fd1;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;">
                View in Admin →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
