import { NextResponse } from "next/server";

import { corsPreflightDenied, rejectIfCrossOrigin } from "@/lib/api-route";

/**
 * Legacy Auth.js catch-all — disabled. Clerk owns customer auth.
 * Same-origin only; no CORS wildcard.
 */

export async function OPTIONS() {
  return corsPreflightDenied();
}

export async function GET(request: Request) {
  const blocked = rejectIfCrossOrigin(request);
  if (blocked) return blocked;

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return NextResponse.redirect(new URL("/sign-in", base));
}

export async function POST(request: Request) {
  const blocked = rejectIfCrossOrigin(request);
  if (blocked) return blocked;

  return NextResponse.json(
    { error: "Gone." },
    { status: 410 },
  );
}
