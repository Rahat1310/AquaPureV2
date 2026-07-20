export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SERVICE_MANAGER"
  | "SUPPORT"
  | "CUSTOMER";

export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  SERVICE_MANAGER: "SERVICE_MANAGER",
  SUPPORT: "SUPPORT",
  CUSTOMER: "CUSTOMER",
} as const;

/** Minimal session shape used by RBAC guards (Clerk-backed). */
export type SessionWithUser = {
  user: {
    id: string;
    role: Role;
    email?: string | null;
    name?: string | null;
  };
};

/**
 * RBAC guard — call at the top of every Server Action.
 *
 * Throws "UNAUTHORIZED" if there is no session.
 * Throws "FORBIDDEN"     if the user's role is not in allowedRoles.
 */
export function requireRole(
  session: SessionWithUser | null,
  allowedRoles: Role[],
): asserts session is SessionWithUser {
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
}

/**
 * Require any authenticated user (all roles allowed).
 */
export function requireAuth(
  session: SessionWithUser | null,
): asserts session is SessionWithUser {
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
}

export function hasRole(
  session: SessionWithUser | null,
  role: Role,
): boolean {
  if (!session?.user) return false;
  return session.user.role === role;
}

export function hasAnyRole(
  session: SessionWithUser | null,
  roles: Role[],
): boolean {
  if (!session?.user) return false;
  return roles.includes(session.user.role);
}
