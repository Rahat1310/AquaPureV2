import type { Role } from "@/lib/rbac";
import { Role as R } from "@/lib/rbac";

/** Staff roles that may enter /admin at all. */
export const STAFF_ROLES: Role[] = [
  R.SUPER_ADMIN,
  R.ADMIN,
  R.SERVICE_MANAGER,
  R.SUPPORT,
];

/**
 * Per-section RBAC for admin routes and Server Actions.
 * Middleware and every action must use the same allow-lists.
 */
export const AdminPermission = {
  DASHBOARD: [R.SUPER_ADMIN, R.ADMIN, R.SERVICE_MANAGER, R.SUPPORT],
  PRODUCTS_READ: [R.SUPER_ADMIN, R.ADMIN, R.SERVICE_MANAGER],
  PRODUCTS_WRITE: [R.SUPER_ADMIN, R.ADMIN],
  PRODUCTS_STOCK: [R.SUPER_ADMIN, R.ADMIN, R.SERVICE_MANAGER],
  ORDERS: [R.SUPER_ADMIN, R.ADMIN, R.SUPPORT],
  SERVICE_REQUESTS: [R.SUPER_ADMIN, R.ADMIN, R.SERVICE_MANAGER],
  USERS: [R.SUPER_ADMIN],
  QUOTES: [R.SUPER_ADMIN, R.ADMIN, R.SUPPORT],
  AUDIT: [R.SUPER_ADMIN],
} as const satisfies Record<string, readonly Role[]>;

export type AdminSection = keyof typeof AdminPermission;

/** Map URL path (under /admin) → required roles. */
export function rolesForAdminPath(pathname: string): Role[] | null {
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/sign-in")
  ) {
    return null;
  }

  if (pathname.startsWith("/admin/products")) {
    return [...AdminPermission.PRODUCTS_READ];
  }
  if (pathname.startsWith("/admin/orders")) {
    return [...AdminPermission.ORDERS];
  }
  if (pathname.startsWith("/admin/service-requests")) {
    return [...AdminPermission.SERVICE_REQUESTS];
  }
  if (pathname.startsWith("/admin/users")) {
    return [...AdminPermission.USERS];
  }
  if (pathname.startsWith("/admin/quotes")) {
    return [...AdminPermission.QUOTES];
  }
  if (pathname.startsWith("/admin/audit")) {
    return [...AdminPermission.AUDIT];
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return [...AdminPermission.DASHBOARD];
  }
  return [...STAFF_ROLES];
}

export type NavItem = {
  href: string;
  label: string;
  section: AdminSection;
};

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", section: "DASHBOARD" },
  { href: "/admin/products", label: "Products", section: "PRODUCTS_READ" },
  { href: "/admin/orders", label: "Orders", section: "ORDERS" },
  {
    href: "/admin/service-requests",
    label: "Service Requests",
    section: "SERVICE_REQUESTS",
  },
  { href: "/admin/quotes", label: "Quote Requests", section: "QUOTES" },
  { href: "/admin/users", label: "Users", section: "USERS" },
  { href: "/admin/audit", label: "Audit Log", section: "AUDIT" },
];

export function navForRole(role: Role): NavItem[] {
  return ADMIN_NAV.filter((item) =>
    (AdminPermission[item.section] as readonly Role[]).includes(role),
  );
}

export function getSessionRole(session: {
  user?: { role?: string } | null;
} | null): Role | null {
  const role = session?.user?.role;
  if (!role) return null;
  return role as Role;
}
