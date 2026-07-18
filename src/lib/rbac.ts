import type { Session } from "next-auth";

export type Role = "SUPER_ADMIN" | "ADMIN" | "SERVICE_MANAGER" | "SUPPORT" | "CUSTOMER";

export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  SERVICE_MANAGER: "SERVICE_MANAGER",
  SUPPORT: "SUPPORT",
  CUSTOMER: "CUSTOMER",
} as const;

/**
 * RBAC guard — call at the top of every Server Action.
 *
 * Throws "UNAUTHORIZED" if there is no session.
 * Throws "FORBIDDEN"     if the user's role is not in allowedRoles.
 *
 * @example
 * const session = await auth();
 * requireRole(session, [Role.ADMIN, Role.SUPER_ADMIN]);
 */
export function requireRole(
  session: Session | null,
  allowedRoles: Role[]
): asserts session is Session {
  if (!session || !session.user) {
    throw new Error("UNAUTHORIZED");
  }

  const userRole = (session.user as { role?: string }).role as Role | undefined;

  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error("FORBIDDEN");
  }
}

/**
 * Convenience: require that the caller is any authenticated user
 * (all roles allowed). Use for customer-facing Server Actions that still
 * need a logged-in session.
 */
export function requireAuth(
  session: Session | null
): asserts session is Session {
  if (!session || !session.user) {
    throw new Error("UNAUTHORIZED");
  }
}

/**
 * Check whether a user has a specific role without throwing.
 * Useful for conditional UI rendering logic in Server Components.
 */
export function hasRole(session: Session | null, role: Role): boolean {
  if (!session?.user) return false;
  return (session.user as { role?: string }).role === role;
}

/**
 * Check whether a user has any of the given roles without throwing.
 */
export function hasAnyRole(
  session: Session | null,
  roles: Role[]
): boolean {
  if (!session?.user) return false;
  const userRole = (session.user as { role?: string }).role as Role | undefined;
  return !!userRole && roles.includes(userRole);
}
