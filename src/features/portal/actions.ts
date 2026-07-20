"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { logAudit } from "@/lib/audit-log";

import {
  addressSchema,
  changePasswordSchema,
  updateProfileSchema,
  wishlistToggleSchema,
} from "./schema";

type ActionResult = { ok: true } | { ok: false; error: string };

function revalidatePortal() {
  revalidatePath("/account");
  revalidatePath("/account/addresses");
  revalidatePath("/account/wishlist");
  revalidatePath("/account/settings");
  revalidatePath("/account/service-requests");
  revalidatePath("/wishlist");
}

export async function createAddress(input: unknown): Promise<ActionResult> {
  const session = await auth();
  requireAuth(session);
  const userId = session.user!.id as string;

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid address." };

  const data = parsed.data;
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      label: data.label,
      recipientName: data.recipientName,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      district: data.district,
      postCode: data.postCode || null,
      isDefault: data.isDefault ?? false,
    },
  });

  await logAudit({
    userId,
    action: "CREATE_ADDRESS",
    entityType: "Address",
    entityId: address.id,
    after: { label: address.label, city: address.city },
  });

  revalidatePortal();
  return { ok: true };
}

export async function updateAddress(
  addressId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await auth();
  requireAuth(session);
  const userId = session.user!.id as string;

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid address." };

  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) return { ok: false, error: "Address not found." };

  const data = parsed.data;
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, NOT: { id: addressId } },
      data: { isDefault: false },
    });
  }

  await prisma.address.update({
    where: { id: addressId },
    data: {
      label: data.label,
      recipientName: data.recipientName,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      district: data.district,
      postCode: data.postCode || null,
      isDefault: data.isDefault ?? existing.isDefault,
    },
  });

  await logAudit({
    userId,
    action: "UPDATE_ADDRESS",
    entityType: "Address",
    entityId: addressId,
    before: { label: existing.label },
    after: { label: data.label },
  });

  revalidatePortal();
  return { ok: true };
}

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  const session = await auth();
  requireAuth(session);
  const userId = session.user!.id as string;

  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) return { ok: false, error: "Address not found." };

  await prisma.address.delete({ where: { id: addressId } });

  await logAudit({
    userId,
    action: "DELETE_ADDRESS",
    entityType: "Address",
    entityId: addressId,
    before: { label: existing.label },
  });

  revalidatePortal();
  return { ok: true };
}

export async function setDefaultAddress(
  addressId: string,
): Promise<ActionResult> {
  const session = await auth();
  requireAuth(session);
  const userId = session.user!.id as string;

  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) return { ok: false, error: "Address not found." };

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ]);

  revalidatePortal();
  return { ok: true };
}

export async function toggleWishlist(input: unknown): Promise<
  ActionResult & { inWishlist?: boolean }
> {
  const session = await auth();
  requireAuth(session);
  const userId = session.user!.id as string;

  const parsed = wishlistToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid product." };

  const { productId } = parsed.data;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) return { ok: false, error: "Product not found." };

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });
    revalidatePortal();
    return { ok: true, inWishlist: false };
  }

  await prisma.wishlist.create({ data: { userId, productId } });
  revalidatePortal();
  return { ok: true, inWishlist: true };
}

export async function removeFromWishlist(
  productId: string,
): Promise<ActionResult> {
  const session = await auth();
  requireAuth(session);
  const userId = session.user!.id as string;

  await prisma.wishlist.deleteMany({ where: { userId, productId } });
  revalidatePortal();
  return { ok: true };
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await auth();
  requireAuth(session);
  const userId = session.user!.id as string;

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid profile data." };

  const before = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    },
  });

  await logAudit({
    userId,
    action: "UPDATE_PROFILE",
    entityType: "User",
    entityId: userId,
    before: before ?? undefined,
    after: parsed.data,
  });

  revalidatePortal();
  return { ok: true };
}

/**
 * Password change requires re-authentication via current password.
 */
export async function changePassword(input: unknown): Promise<ActionResult> {
  const session = await auth();
  requireAuth(session);
  const userId = session.user!.id as string;

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid password input.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return { ok: false, error: "Password change is not available." };
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  await logAudit({
    userId,
    action: "CHANGE_PASSWORD",
    entityType: "User",
    entityId: userId,
    after: { changed: true },
  });

  return { ok: true };
}
