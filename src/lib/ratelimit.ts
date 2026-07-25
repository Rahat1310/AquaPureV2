import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Shared Upstash rate limiters for Server Actions.
 * When UPSTASH_* env vars are missing (local/dev), checks no-op allow —
 * production must set credentials for real protection.
 */

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

/** Inquiry / quote form — 5 submissions per IP per 15 minutes. */
export const inquiryRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "pmw:ratelimit:inquiry",
      analytics: true,
    })
  : null;

/** Checkout — 5 attempts per identifier per 60 seconds. */
export const checkoutRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "pmw:ratelimit:checkout",
      analytics: true,
    })
  : null;

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

/**
 * Run a limiter. If Upstash is not configured, allow (dev) but log once.
 */
export async function enforceRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<RateLimitResult> {
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[ratelimit] UPSTASH_REDIS_REST_URL/TOKEN missing — rate limit skipped",
      );
    }
    return { success: true, remaining: 999, reset: Date.now() };
  }

  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, reset };
}
