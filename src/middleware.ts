import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Must match ADMIN_COOKIE in src/lib/admin-auth.ts */
const ADMIN_COOKIE = "pmw_admin_session";

// ── Bot / uptime-monitor detection ────────────────────────────────────────────
//
// We short-circuit requests from known uptime monitors and generic scrapers so
// they never trigger per-request DB work (auth lookups, session writes, etc.).
//
// IMPORTANT: Do NOT add Googlebot, Bingbot, or other legitimate search engine
// crawlers here — we want those to index the site normally.
//
// To add new patterns, append a new regex to BOT_PATTERNS.

const BOT_PATTERNS: RegExp[] = [
  // Uptime monitors
  /UptimeRobot/i,
  /Pingdom/i,
  /StatusCake/i,
  /Better\s?Uptime/i,
  /Site24x7/i,
  /Freshping/i,
  /Oh\s?Dear/i,
  // Generic scraper / spider signals — but NOT "Googlebot", "bingbot", etc.
  /\bbot\b/i,
  /\bcrawl\b/i,
  /\bspider\b/i,
  /\bslurp\b/i,
];

// These are legitimate search-engine UA strings we must NEVER block.
const SEARCH_ENGINE_WHITELIST = /Googlebot|bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot/i;

function isNonIndexingBot(ua: string): boolean {
  if (!ua) return false;
  if (SEARCH_ENGINE_WHITELIST.test(ua)) return false;
  return BOT_PATTERNS.some((re) => re.test(ua));
}

const isCustomerProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/orders(.*)",
  "/wishlist(.*)",
  "/checkout(.*)",
  "/track-order(.*)",
]);

const isAdminPublic = createRouteMatcher([
  "/admin/login(.*)",
  "/admin/sign-in(.*)",
]);

const isAdminProtected = createRouteMatcher(["/admin(.*)"]);

const isCheckoutConfirmation = createRouteMatcher([
  "/checkout/confirmation(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // ── Non-indexing bot fast-path ─────────────────────────────────────────────
  // Uptime monitors and generic scrapers: pass through immediately so they
  // hit the cached responses from Fix 1 without triggering any session/auth
  // DB work. Search engines are whitelisted above and never reach this branch.
  const ua = req.headers.get("user-agent") ?? "";
  if (isNonIndexingBot(ua)) {
    return NextResponse.next();
  }

  // ── Admin: hardcoded cookie session (not Clerk) ────────────────────────────
  if (isAdminProtected(req) && !isAdminPublic(req)) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) {
      const login = new URL("/admin/login", req.url);
      login.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  // ── Customer protected routes (Clerk only) ─────────────────────────────────
  if (isCustomerProtected(req) && !isCheckoutConfirmation(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signIn = new URL("/sign-in", req.url);
      signIn.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signIn);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

