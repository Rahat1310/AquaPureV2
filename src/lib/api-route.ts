import "server-only";

import { NextResponse } from "next/server";
import type { ZodType } from "zod";

/**
 * Shared helpers for App Router API routes:
 * - generic client errors (no stack traces)
 * - same-origin CORS (no wildcards)
 * - Zod parse → reject early
 */

function allowedOrigins(): string[] {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const extras = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);

  const origins = new Set<string>(extras);
  if (base) origins.add(base);

  // Local Next.js defaults when BASE_URL unset
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return [...origins];
}

/**
 * Returns true if the request is same-origin (or has no Origin, e.g. server-to-server / same-tab navigation).
 * Browser cross-origin calls with a foreign Origin are rejected.
 */
export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser / same-origin navigation often omits Origin
  return allowedOrigins().includes(origin.replace(/\/$/, ""));
}

/** Reject cross-origin browser calls. Does not set Access-Control-Allow-Origin. */
export function rejectIfCrossOrigin(req: Request): NextResponse | null {
  if (isAllowedOrigin(req)) return null;
  console.warn("[api] blocked cross-origin request", {
    origin: req.headers.get("origin"),
    path: new URL(req.url).pathname,
  });
  return apiError("Forbidden.", 403);
}

/** Generic JSON error — never include stack traces or Prisma internals. */
export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function apiOk<T>(data: T, init?: { status?: number; headers?: HeadersInit }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: init?.headers,
  });
}

/**
 * Parse input with Zod. On failure: log issues server-side, return generic 400.
 */
export function parseOrError<T>(
  schema: ZodType<T>,
  input: unknown,
  logLabel: string,
): { data: T } | { response: NextResponse } {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { data: parsed.data };

  console.warn(`[api] ${logLabel} validation failed`, {
    issues: parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    })),
  });
  return { response: apiError("Invalid request.", 400) };
}

/** Wrap route handlers so unexpected errors never leak internals. */
export async function withApiHandler(
  label: string,
  fn: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[api] ${label}`, err);
    return apiError("Something went wrong.", 500);
  }
}

/**
 * Explicitly refuse CORS preflight with a wildcard.
 * Same-origin apps don't need CORS; cross-origin preflight gets 403.
 */
export function corsPreflightDenied(): NextResponse {
  return new NextResponse(null, {
    status: 403,
    headers: {
      // Intentionally no Access-Control-Allow-Origin
      Vary: "Origin",
    },
  });
}
