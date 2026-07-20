import "server-only";

import { prisma } from "@/lib/prisma";

function toNum(d: unknown): number {
  return d ? parseFloat(String(d)) : 0;
}

function parseImages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export async function getAddressesByUser(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getWishlistByUser(userId: string) {
  const rows = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          images: true,
          stock: true,
          status: true,
          brand: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    productId: row.productId,
    addedAt: row.createdAt.toISOString(),
    product: {
      id: row.product.id,
      name: row.product.name,
      slug: row.product.slug,
      price: toNum(row.product.price),
      compareAtPrice: row.product.compareAtPrice
        ? toNum(row.product.compareAtPrice)
        : null,
      image: parseImages(row.product.images)[0] ?? null,
      stock: row.product.stock,
      status: row.product.status,
      brand: row.product.brand,
    },
  }));
}

export async function getServiceRequestsByUser(userId: string) {
  return prisma.serviceRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      technician: { select: { id: true, name: true, phone: true } },
    },
  });
}

export async function getProfileByUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function getPortalOverview(userId: string) {
  const [orderCount, addressCount, wishlistCount, openServices] =
    await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.address.count({ where: { userId } }),
      prisma.wishlist.count({ where: { userId } }),
      prisma.serviceRequest.count({
        where: {
          userId,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      }),
    ]);

  return { orderCount, addressCount, wishlistCount, openServices };
}
