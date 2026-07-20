import { NextResponse } from "next/server";

/** Auth.js removed — Clerk handles auth. */
export function GET() {
  return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"));
}

export function POST() {
  return NextResponse.json(
    { error: "Auth.js disabled. Use Clerk at /sign-in." },
    { status: 410 },
  );
}
