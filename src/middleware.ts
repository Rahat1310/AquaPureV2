import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { rolesForAdminPath } from "@/features/admin/permissions";
import {
  isStaffEmail,
  isStaffRole,
  roleForEmail,
} from "@/lib/staff-roles";

const isCustomerProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/orders(.*)",
  "/wishlist(.*)",
  "/checkout(.*)",
]);

const isAdminPublic = createRouteMatcher([
  "/admin/login(.*)",
  "/admin/sign-in(.*)",
]);

const isAdminProtected = createRouteMatcher(["/admin(.*)"]);

const isCheckoutConfirmation = createRouteMatcher([
  "/checkout/confirmation(.*)",
]);

function emailFromClaims(sessionClaims: unknown): string | null {
  if (!sessionClaims || typeof sessionClaims !== "object") return null;
  const claims = sessionClaims as Record<string, unknown>;
  if (typeof claims.email === "string") return claims.email;
  if (typeof claims.primary_email === "string") return claims.primary_email;
  const addr = claims.email_addresses;
  if (Array.isArray(addr) && typeof addr[0] === "string") return addr[0];
  // Clerk default JWT often nests under this shape when customized
  const meta = claims.metadata;
  if (meta && typeof meta === "object") {
    const m = meta as Record<string, unknown>;
    if (typeof m.email === "string") return m.email;
  }
  return null;
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const { userId, sessionClaims } = await auth();

  // ── Admin routes ───────────────────────────────────────────────────────────
  if (isAdminProtected(req) && !isAdminPublic(req)) {
    if (!userId) {
      const signIn = new URL("/admin/sign-in", req.url);
      signIn.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signIn);
    }

    const email = emailFromClaims(sessionClaims);
    // If email isn't in the JWT yet, allow through — panel layout re-checks via DB sync.
    if (email && !isStaffEmail(email)) {
      return NextResponse.redirect(new URL("/account", req.url));
    }

    if (email) {
      const role = roleForEmail(email);
      const allowed = rolesForAdminPath(pathname);
      if (allowed && isStaffRole(role) && !allowed.includes(role)) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }

  // ── Customer protected routes ──────────────────────────────────────────────
  if (isCustomerProtected(req) && !isCheckoutConfirmation(req)) {
    if (!userId) {
      const signIn = new URL("/sign-in", req.url);
      signIn.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signIn);
    }

    const email = emailFromClaims(sessionClaims);
    if (email && isStaffEmail(email) && !pathname.startsWith("/checkout")) {
      // Staff landing on customer portal → admin
      if (
        pathname.startsWith("/account") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/orders") ||
        pathname.startsWith("/wishlist")
      ) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
