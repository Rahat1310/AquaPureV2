import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCartSummary } from "@/features/cart/queries";

/**
 * GET /api/cart/summary
 * Returns the current cart summary (works for both auth users and guests via cookie).
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const summary = await getCartSummary(userId);
  return NextResponse.json(summary);
}
