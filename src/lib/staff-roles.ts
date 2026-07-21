import type { Role } from "@/lib/rbac";
import { Role as R } from "@/lib/rbac";

/**
 * Legacy helpers. Admin access is now a single hardcoded env account
 * (ADMIN_EMAIL / ADMIN_PASSWORD) via cookie session — not Clerk staff roles.
 * Clerk users are always CUSTOMER.
 */

export const STAFF_ROLES: Role[] = [
  R.SUPER_ADMIN,
  R.ADMIN,
  R.SERVICE_MANAGER,
  R.SUPPORT,
];

export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return email.trim().toLowerCase();
}

export function roleForEmail(_email: string | null | undefined): Role {
  return R.CUSTOMER;
}

export function isStaffRole(role: Role | string | null | undefined): boolean {
  return !!role && STAFF_ROLES.includes(role as Role);
}

export function isStaffEmail(_email: string | null | undefined): boolean {
  return false;
}
