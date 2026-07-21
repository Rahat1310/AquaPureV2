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

/** Upsert Prisma user from Clerk. Public customers only — never staff. */
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

/** Customer session via Clerk. Admin panel uses getAdminSession() instead. */
export async function auth(): Promise<AppSession | null> {
  const { userId } = await clerkAuth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const dbUser = await syncUserFromClerk(clerkUser);
  if (!dbUser.isActive) return null;

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: R.CUSTOMER,
      image: dbUser.image,
    },
  };
}

export async function signOut(_opts?: { redirectTo?: string }): Promise<void> {
  void _opts;
}
