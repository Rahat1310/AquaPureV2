import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Must match ADMIN_COOKIE in src/lib/admin-auth.ts */
const ADMIN_COOKIE = "pmw_admin_session";

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

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

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
