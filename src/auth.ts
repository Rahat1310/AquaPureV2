import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/rbac";
import { Role as R } from "@/lib/rbac";

export type AppUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: Role;
  image: string | null;
};

export type AppSession = {
  user: AppUser;
};

type ClerkUserLike = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

function primaryEmail(user: ClerkUserLike): string | null {
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  );
  return (
    primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null
  );
}

/** Upsert Prisma user from Clerk. Public customers only — never staff.
 *
 * @deprecated Use the Clerk webhook at /api/webhooks/clerk instead for
 * background sync. This function is retained for one-off manual calls only
 * (e.g. if you need to force-sync a specific user from a script).
 */
export async function syncUserFromClerk(clerkUser: ClerkUserLike) {
  const email = primaryEmail(clerkUser);
  const role = R.CUSTOMER;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    email;
  const image = clerkUser.imageUrl || null;

  const existingByClerk = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (existingByClerk) {
    return prisma.user.update({
      where: { id: existingByClerk.id },
      data: {
        email: email ?? existingByClerk.email,
        name,
        image,
        role: R.CUSTOMER,
        emailVerified: email ? new Date() : existingByClerk.emailVerified,
      },
    });
  }

  if (email) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          clerkId: clerkUser.id,
          name: name ?? existingByEmail.name,
          image: image ?? existingByEmail.image,
          emailVerified: new Date(),
        },
      });
    }
  }

  const created = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email,
      name,
      image,
      role,
      emailVerified: email ? new Date() : null,
      isActive: true,
    },
  });

  try {
    const { mergeGuestCart } = await import("@/features/cart/actions");
    await mergeGuestCart(created.id);
  } catch {
    // ignore cart merge failures
  }

  return created;
}

/**
 * Customer session via Clerk.
 *
 * Avoids sign-in → /account → /sign-in loops: if the Prisma row is missing
 * (webhook delay / first login race), we create/attach it on the spot instead
 * of returning null. Row sync still happens primarily via /api/webhooks/clerk;
 * this is a safe fallback for the first authenticated request.
 */
export async function auth(): Promise<AppSession | null> {
  const { userId } = await clerkAuth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Fast path: existing row
  const existing = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, email: true, name: true, image: true, isActive: true },
  });

  if (existing) {
    if (!existing.isActive) return null;
    return {
      user: {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        role: R.CUSTOMER,
        image: existing.image,
      },
    };
  }

  // First login / webhook race: create or attach the row now (prevents loop)
  const email = primaryEmail(clerkUser);
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    email;
  const image = clerkUser.imageUrl || null;

  try {
    const created = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        image,
        role: R.CUSTOMER,
        emailVerified: email ? new Date() : null,
        isActive: true,
      },
      select: { id: true, email: true, name: true, image: true },
    });

    try {
      const { mergeGuestCart } = await import("@/features/cart/actions");
      await mergeGuestCart(created.id);
    } catch {
      // non-critical
    }

    return {
      user: {
        id: created.id,
        email: created.email,
        name: created.name,
        role: R.CUSTOMER,
        image: created.image,
      },
    };
  } catch {
    // Email already exists but clerkId wasn't linked (legacy user) — attach
    if (email) {
      const linked = await prisma.user.updateMany({
        where: { email, clerkId: null },
        data: { clerkId: userId, name, image, emailVerified: new Date() },
      });
      if (linked.count > 0) {
        const row = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, image: true },
        });
        if (row) {
          return {
            user: {
              id: row.id,
              email: row.email,
              name: row.name,
              role: R.CUSTOMER,
              image: row.image,
            },
          };
        }
      }
    }
    return null;
  }
}

export async function signOut(_opts?: { redirectTo?: string }): Promise<void> {
  void _opts;
}
