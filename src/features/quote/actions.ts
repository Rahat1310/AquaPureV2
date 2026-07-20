"use server";

import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { renderQuoteNotificationEmail } from "./emails/QuoteNotificationEmail";
import { quoteRequestSchema, type QuoteRequestResult } from "./schema";

// ─── In-memory rate limiter ────────────────────────────────────────────────────
// Max 5 quote submissions per IP per hour.
// Simple Map-based LRU — suitable for a single-process dev/preview deployment.
// In production behind multiple instances, replace with Redis / Upstash.

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true; // allowed
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // blocked
  }

  entry.count += 1;
  return true; // allowed
}

// ─── Action ───────────────────────────────────────────────────────────────────

/**
 * Public lead-capture action for consultation / quote requests.
 *
 * Security:
 *  - Honeypot: if `_website` is non-empty the request is silently rejected.
 *  - Rate limit: max 5 submissions per IP per hour.
 *  - Zod validation on all fields server-side.
 *
 * Side effects on success:
 *  - Writes a QuoteRequest row to the DB.
 *  - Sends an internal notification email to sales staff.
 */
export async function createQuoteRequest(
  input: unknown,
): Promise<QuoteRequestResult> {
  // ── Honeypot check ──────────────────────────────────────────────────────────
  // If the honeypot field has any value, silently pretend success (confuse bots).
  const rawInput = input as Record<string, unknown>;
  if (rawInput?._website && String(rawInput._website).length > 0) {
    return { ok: true }; // Silent reject
  }

  // ── Rate limiting ───────────────────────────────────────────────────────────
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return {
      ok: false,
      error: "Too many requests. Please try again in an hour.",
    };
  }

  // ── Zod validation ──────────────────────────────────────────────────────────
  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid submission.",
    };
  }

  const { name, company, phone, email, requirement, capacityNeeded } = parsed.data;

  // ── DB write ────────────────────────────────────────────────────────────────
  try {
    const quote = await prisma.quoteRequest.create({
      data: {
        name,
        company: company || null,
        phone,
        email: email || null,
        requirement,
        capacityNeeded: capacityNeeded || null,
        status: "NEW",
      },
    });

    // ── Notification email to sales (non-blocking) ───────────────────────────
    const salesEmail = process.env.EMAIL_SALES;
    if (salesEmail) {
      sendEmail({
        to: salesEmail,
        subject: `New Quote Request from ${name}`,
        html: renderQuoteNotificationEmail({
          id: quote.id,
          name: quote.name,
          company: quote.company,
          phone: quote.phone,
          email: quote.email,
          requirement: quote.requirement,
          capacityNeeded: quote.capacityNeeded,
          createdAt: quote.createdAt.toLocaleString("en-BD"),
        }),
      }).catch(() => undefined); // Non-blocking
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
