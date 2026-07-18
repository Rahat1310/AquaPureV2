"use server";

import { prisma } from "@/lib/prisma";

import { quoteRequestSchema, type QuoteRequestResult } from "./schema";

/**
 * Public lead-capture action for consultation / quote requests.
 * Validates input server-side with Zod regardless of client state.
 * No RBAC gate: this is an unauthenticated public form. It only *creates*
 * a NEW lead — it never reads or mutates existing privileged data.
 */
export async function createQuoteRequest(
  input: unknown,
): Promise<QuoteRequestResult> {
  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid submission.",
    };
  }

  const { name, company, phone, email, requirement } = parsed.data;

  try {
    await prisma.quoteRequest.create({
      data: {
        name,
        company: company || null,
        phone,
        email: email || null,
        requirement,
        status: "NEW",
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
