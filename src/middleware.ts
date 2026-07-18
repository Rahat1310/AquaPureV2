import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CUSTOMER_PROTECTED = ["/dashboard", "/account", "/orders", "/wishlist"];
const STAFF_PROTECTED = ["/admin"];
const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "SERVICE_MANAGER", "SUPPORT"];

export default auth(function middleware(req: NextRequest & { auth: unknown }) {
  const session = (req as { auth: { user?: { role?: string } } | null }).auth;
  const { pathname } = req.nextUrl;

  // ── Protect staff/admin routes ─────────────────────────────
  const isStaffRoute = STAFF_PROTECTED.some((p) => pathname.startsWith(p));
  if (isStaffRoute) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/staff/login", req.url));
    }
    const role = session.user.role ?? "";
    if (!STAFF_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/staff/login", req.url));
    }
  }

  // ── Protect customer dashboard routes ──────────────────────
  const isCustomerRoute = CUSTOMER_PROTECTED.some((p) =>
    pathname.startsWith(p)
  );
  if (isCustomerRoute) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Staff who land on customer routes get redirected to admin
    const role = session.user.role ?? "";
    if (STAFF_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/admin/:path*",
  ],
};
