"use server";

import { headers } from "next/headers";

import { enforceRateLimit, inquiryRatelimit } from "@/lib/ratelimit";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { renderQuoteNotificationEmail } from "./emails/QuoteNotificationEmail";
import {
  INQUIRY_MIN_FILL_MS,
  quoteRequestSchema,
  type QuoteRequestResult,
} from "./schema";

function clientIp(headerStore: Headers): string {
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    headerStore.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Public lead-capture action for consultation / quote / inquiry requests.
 *
 * Anti-spam layers (in order):
 *  1. Honeypot `_website` — silent fake success if filled
 *  2. Timing `_formOpenedAt` — silent fake success if < ~2s
 *  3. Zod validation + sanitization (no script / header injection)
 *  4. Upstash sliding-window rate limit — 5 / IP / 15 minutes
 *  5. (Optional later) Cloudflare Turnstile — only if spam persists
 */
export async function createQuoteRequest(
  input: unknown,
): Promise<QuoteRequestResult> {
  const raw = (input ?? {}) as Record<string, unknown>;

  // ── 1. Honeypot ────────────────────────────────────────────────────────────
  if (typeof raw._website === "string" && raw._website.trim().length > 0) {
    return { ok: true };
  }

  // ── 2. Timing check ────────────────────────────────────────────────────────
  const openedAt = Number(raw._formOpenedAt);
  // Missing / invalid / too-fast / absurd timestamps → silent fake success
  if (!Number.isFinite(openedAt) || openedAt <= 0) {
    return { ok: true };
  }
  if (Date.now() - openedAt < INQUIRY_MIN_FILL_MS) {
    return { ok: true };
  }
  if (Math.abs(Date.now() - openedAt) > 5 * 60 * 1000) {
    return { ok: true };
  }

  // ── 4. Rate limit (before DB / email) ───────────────────────────────────────
  const headerStore = await headers();
  const ip = clientIp(headerStore);
  const limit = await enforceRateLimit(inquiryRatelimit, `inquiry:${ip}`);
  if (!limit.success) {
    return {
      ok: false,
      error: "Too many requests. Please try again in a few minutes.",
    };
  }

  // ── 3. Zod validation + sanitize ───────────────────────────────────────────
  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid submission.",
    };
  }

  const { name, company, phone, email, requirement, capacityNeeded } =
    parsed.data;

  // Extra belt-and-suspenders: never allow newlines into email subject fields
  const safeName = name.replace(/[\r\n]+/g, " ").slice(0, 80);

  try {
    const quote = await prisma.quoteRequest.create({
      data: {
        name: safeName,
        company: company || null,
        phone,
        email: email || null,
        requirement,
        capacityNeeded: capacityNeeded || null,
        status: "NEW",
      },
    });

    const salesEmail = process.env.EMAIL_SALES;
    if (salesEmail) {
      sendEmail({
        to: salesEmail,
        subject: `New Quote Request from ${safeName}`,
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
      }).catch(() => undefined);
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
