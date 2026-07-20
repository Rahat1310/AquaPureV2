import type { Role } from "@/lib/rbac";
import { Role as R } from "@/lib/rbac";

/**
 * Hardcoded staff ACL (Option A — temporary).
 * Invite these emails in the Clerk Dashboard; do NOT expose public admin signup.
 * Later: move to Clerk publicMetadata or a DB-managed staff table.
 */
export const HARDCODED_STAFF_ROLES: Record<string, Role> = {
  "superadmin@aquapure.com.bd": R.SUPER_ADMIN,
  "admin@aquapure.com.bd": R.ADMIN,
  "service@aquapure.com.bd": R.SERVICE_MANAGER,
  "support@aquapure.com.bd": R.SUPPORT,
};

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

/** Resolve app role from email (staff map wins; everyone else is CUSTOMER). */
export function roleForEmail(email: string | null | undefined): Role {
  const key = normalizeEmail(email);
  if (!key) return R.CUSTOMER;
  return HARDCODED_STAFF_ROLES[key] ?? R.CUSTOMER;
}

export function isStaffRole(role: Role | string | null | undefined): boolean {
  return !!role && STAFF_ROLES.includes(role as Role);
}

export function isStaffEmail(email: string | null | undefined): boolean {
  return isStaffRole(roleForEmail(email));
}
