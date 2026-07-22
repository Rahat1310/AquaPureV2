"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { requireRole, Role } from "@/lib/rbac";

import { writeAuditLog } from "./audit";
import { AdminPermission } from "./permissions";
import {
  bulkProductActionSchema,
  createProductSchema,
  initiateRefundSchema,
  updateOrderStatusSchema,
  updatePriceSchema,
  updateProductSchema,
  updateQuoteRequestSchema,
  updateServiceRequestSchema,
  updateStockSchema,
  updateUserSchema,
} from "./schema";
import { slugify } from "./slugify";

type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

function actorId(session: { user?: { id?: string | null } | null }): string {
  return session.user?.id ?? "";
}

function revalidateCatalog() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/category");
  revalidatePath("/product");
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base || "product";
  let n = 0;
  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate;
    }
    n += 1;
    candidate = `${base}-${n}`;
  }
}

// ─── Pricing / inventory / order status (existing) ────────────────────────────

export async function updateProductPricing(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.PRODUCTS_WRITE]);

  const parsed = updatePriceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid pricing input." };
  }
  const { productId, price, compareAtPrice } = parsed.data;

  const productBefore = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, compareAtPrice: true },
  });

  if (!productBefore) {
    return { ok: false, error: "Product not found." };
  }

  const productAfter = await prisma.product.update({
    where: { id: productId },
    data: { price, compareAtPrice: compareAtPrice ?? null },
    select: { price: true, compareAtPrice: true },
  });

  await writeAuditLog({
    userId: actorId(session),
    action: "UPDATE_PRODUCT_PRICE",
    entityType: "Product",
    entityId: productId,
    beforeJson: productBefore,
    afterJson: productAfter,
  });

  revalidateCatalog();
  return { ok: true };
}

export async function updateProductInventory(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.PRODUCTS_STOCK]);

  const parsed = updateStockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid inventory input." };

  const { productId, stock } = parsed.data;

  const productBefore = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  });

  if (!productBefore) return { ok: false, error: "Product not found." };

  const productAfter = await prisma.product.update({
    where: { id: productId },
    data: { stock },
    select: { stock: true },
  });

  await writeAuditLog({
    userId: actorId(session),
    action: "UPDATE_PRODUCT_INVENTORY",
    entityType: "Product",
    entityId: productId,
    beforeJson: productBefore,
    afterJson: productAfter,
  });

  revalidateCatalog();
  return { ok: true };
}

export async function updateOrderStatus(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.ORDERS]);

  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid order status." };

  const { orderId, status } = parsed.data;

  const orderBefore = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, paymentStatus: true, paymentMethod: true },
  });

  if (!orderBefore) return { ok: false, error: "Order not found." };

  // Fulfillment past Pending implies payment accepted (COD collected / bKash verified).
  const marksPaid = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(status);

  const orderAfter = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(marksPaid
        ? { paymentStatus: "PAID", paidAt: new Date() }
        : status === "PENDING"
          ? { paymentStatus: "PENDING", paidAt: null }
          : {}),
    },
    select: { status: true, paymentStatus: true, paidAt: true },
  });

  await writeAuditLog({
    userId: actorId(session),
    action: "UPDATE_ORDER_STATUS",
    entityType: "Order",
    entityId: orderId,
    beforeJson: orderBefore,
    afterJson: orderAfter,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

// ─── Products CRUD ────────────────────────────────────────────────────────────

export async function createProduct(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.PRODUCTS_WRITE]);

  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid product input.",
    };
  }

  const data = parsed.data;
  const slug = await ensureUniqueSlug(slugify(data.slug || data.name));

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku: data.sku,
        description: data.description ?? null,
        price: new Prisma.Decimal(data.price),
        compareAtPrice:
          data.compareAtPrice != null
            ? new Prisma.Decimal(data.compareAtPrice)
            : null,
        stock: data.stock,
        images: JSON.stringify(data.images),
        brand: data.brand ?? null,
        status: data.status,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        status: true,
        price: true,
        stock: true,
      },
    });

    await writeAuditLog({
      userId: actorId(session),
      action: "CREATE_PRODUCT",
      entityType: "Product",
      entityId: product.id,
      afterJson: product,
    });

    revalidateCatalog();
    return { ok: true, id: product.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "A product with this SKU or slug already exists." };
    }
    console.error("[createProduct]", error);
    return { ok: false, error: "Failed to create product." };
  }
}

export async function updateProduct(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.PRODUCTS_WRITE]);

  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid product input.",
    };
  }

  const data = parsed.data;

  const before = await prisma.product.findUnique({
    where: { id: data.id },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      images: true,
      brand: true,
      status: true,
      categoryId: true,
      isFeatured: true,
      isBestSeller: true,
    },
  });

  if (!before) return { ok: false, error: "Product not found." };

  const slug = await ensureUniqueSlug(slugify(data.slug || data.name), data.id);

  try {
    const after = await prisma.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug,
        sku: data.sku,
        description: data.description ?? null,
        price: new Prisma.Decimal(data.price),
        compareAtPrice:
          data.compareAtPrice != null
            ? new Prisma.Decimal(data.compareAtPrice)
            : null,
        stock: data.stock,
        images: JSON.stringify(data.images),
        brand: data.brand ?? null,
        status: data.status,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        price: true,
        compareAtPrice: true,
        stock: true,
        images: true,
        brand: true,
        status: true,
        categoryId: true,
        isFeatured: true,
        isBestSeller: true,
      },
    });

    await writeAuditLog({
      userId: actorId(session),
      action: "UPDATE_PRODUCT",
      entityType: "Product",
      entityId: data.id,
      beforeJson: before,
      afterJson: after,
    });

    revalidateCatalog();
    revalidatePath(`/admin/products/${data.id}`);
    return { ok: true, id: data.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "A product with this SKU or slug already exists." };
    }
    console.error("[updateProduct]", error);
    return { ok: false, error: "Failed to update product." };
  }
}

export async function deleteProduct(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.PRODUCTS_WRITE]);

  const id =
    typeof input === "string"
      ? input
      : typeof input === "object" &&
          input !== null &&
          "id" in input &&
          typeof (input as { id: unknown }).id === "string"
        ? (input as { id: string }).id
        : null;

  if (!id) return { ok: false, error: "Product id is required." };

  const before = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      status: true,
      _count: { select: { orderItems: true, cartItems: true } },
    },
  });

  if (!before) return { ok: false, error: "Product not found." };

  if (before._count.orderItems > 0) {
    return {
      ok: false,
      error:
        "Cannot delete a product with order history. Mark it DISCONTINUED instead.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.wishlist.deleteMany({ where: { productId: id } });
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    await writeAuditLog({
      userId: actorId(session),
      action: "DELETE_PRODUCT",
      entityType: "Product",
      entityId: id,
      beforeJson: {
        id: before.id,
        name: before.name,
        slug: before.slug,
        sku: before.sku,
        status: before.status,
      },
    });

    revalidateCatalog();
    return { ok: true };
  } catch (error) {
    console.error("[deleteProduct]", error);
    return { ok: false, error: "Failed to delete product." };
  }
}

export async function bulkProductAction(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.PRODUCTS_WRITE]);

  const parsed = bulkProductActionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid bulk action.",
    };
  }

  const { productIds, action, status } = parsed.data;

  if (action === "status") {
    const result = await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { status: status! },
    });

    await writeAuditLog({
      userId: actorId(session),
      action: "BULK_UPDATE_PRODUCT_STATUS",
      entityType: "Product",
      entityId: productIds.join(","),
      afterJson: { productIds, status, count: result.count },
    });

    revalidateCatalog();
    return { ok: true };
  }

  // delete
  const blocked = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      orderItems: { some: {} },
    },
    select: { id: true, name: true },
  });

  if (blocked.length > 0) {
    return {
      ok: false,
      error: `Cannot delete products with order history: ${blocked
        .map((p) => p.name)
        .join(", ")}. Mark them DISCONTINUED instead.`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.wishlist.deleteMany({ where: { productId: { in: productIds } } });
    await tx.cartItem.deleteMany({ where: { productId: { in: productIds } } });
    await tx.review.deleteMany({ where: { productId: { in: productIds } } });
    await tx.productVariant.deleteMany({
      where: { productId: { in: productIds } },
    });
    await tx.product.deleteMany({ where: { id: { in: productIds } } });
  });

  await writeAuditLog({
    userId: actorId(session),
    action: "BULK_DELETE_PRODUCTS",
    entityType: "Product",
    entityId: productIds.join(","),
    beforeJson: { productIds },
  });

  revalidateCatalog();
  return { ok: true };
}

// ─── Refunds ──────────────────────────────────────────────────────────────────

export async function initiateRefund(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.ORDERS]);

  const parsed = initiateRefundSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid refund request.",
    };
  }

  const { orderId, reason } = parsed.data;

  const orderBefore = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, notes: true, orderNumber: true },
  });

  if (!orderBefore) return { ok: false, error: "Order not found." };

  if (orderBefore.status === "CANCELLED") {
    return { ok: false, error: "Order is already cancelled." };
  }

  const stamp = new Date().toISOString();
  const refundNote = `[REFUND ${stamp}] ${reason}`;
  const notes = orderBefore.notes
    ? `${orderBefore.notes}\n${refundNote}`
    : refundNote;

  const nextStatus =
    orderBefore.status === "DELIVERED" ? orderBefore.status : "CANCELLED";

  const orderAfter = await prisma.order.update({
    where: { id: orderId },
    data: {
      notes,
      status: nextStatus,
    },
    select: { id: true, status: true, notes: true, orderNumber: true },
  });

  await writeAuditLog({
    userId: actorId(session),
    action: "INITIATE_REFUND",
    entityType: "Order",
    entityId: orderId,
    beforeJson: orderBefore,
    afterJson: { ...orderAfter, reason },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

// ─── Service requests ─────────────────────────────────────────────────────────

export async function updateServiceRequest(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.SERVICE_REQUESTS]);

  const parsed = updateServiceRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid service request input.",
    };
  }

  const { id, status, technicianId } = parsed.data;

  const before = await prisma.serviceRequest.findUnique({
    where: { id },
    select: { id: true, status: true, technicianId: true },
  });

  if (!before) return { ok: false, error: "Service request not found." };

  if (technicianId) {
    const tech = await prisma.user.findFirst({
      where: {
        id: technicianId,
        isActive: true,
        role: {
          in: [Role.SERVICE_MANAGER, Role.ADMIN, Role.SUPPORT, Role.SUPER_ADMIN],
        },
      },
      select: { id: true },
    });
    if (!tech) {
      return { ok: false, error: "Technician not found or not eligible." };
    }
  }

  const after = await prisma.serviceRequest.update({
    where: { id },
    data: {
      status,
      technicianId: technicianId === undefined ? undefined : technicianId,
    },
    select: { id: true, status: true, technicianId: true },
  });

  await writeAuditLog({
    userId: actorId(session),
    action: "UPDATE_SERVICE_REQUEST",
    entityType: "ServiceRequest",
    entityId: id,
    beforeJson: before,
    afterJson: after,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/service-requests");
  return { ok: true };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function updateUser(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.USERS]);

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid user input.",
    };
  }

  const { id, role, isActive, twoFactorEnabled } = parsed.data;
  const actor = actorId(session);

  const before = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      isActive: true,
      twoFactorEnabled: true,
      email: true,
      name: true,
    },
  });

  if (!before) return { ok: false, error: "User not found." };

  const demotingSuperAdmin =
    before.role === Role.SUPER_ADMIN && role !== Role.SUPER_ADMIN;
  const deactivatingSuperAdmin =
    before.role === Role.SUPER_ADMIN && isActive === false;

  if (demotingSuperAdmin || deactivatingSuperAdmin) {
    const superAdminCount = await prisma.user.count({
      where: { role: Role.SUPER_ADMIN, isActive: true },
    });
    if (superAdminCount <= 1) {
      return {
        ok: false,
        error: "Cannot demote or deactivate the last SUPER_ADMIN.",
      };
    }
  }

  // Self-demotion when you are the only SUPER_ADMIN is already covered above;
  // also block changing own role away from SUPER_ADMIN if you are the sole one.
  if (id === actor && demotingSuperAdmin) {
    const superAdminCount = await prisma.user.count({
      where: { role: Role.SUPER_ADMIN, isActive: true },
    });
    if (superAdminCount <= 1) {
      return {
        ok: false,
        error: "Cannot change your own role when you are the only SUPER_ADMIN.",
      };
    }
  }

  const after = await prisma.user.update({
    where: { id },
    data: { role, isActive, twoFactorEnabled },
    select: {
      id: true,
      role: true,
      isActive: true,
      twoFactorEnabled: true,
      email: true,
      name: true,
    },
  });

  await writeAuditLog({
    userId: actor,
    action: "UPDATE_USER",
    entityType: "User",
    entityId: id,
    beforeJson: before,
    afterJson: after,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { ok: true };
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export async function updateQuoteRequest(input: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.QUOTES]);

  const parsed = updateQuoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid quote input.",
    };
  }

  const { id, status, assignedToId } = parsed.data;

  const before = await prisma.quoteRequest.findUnique({
    where: { id },
    select: { id: true, status: true, assignedToId: true },
  });

  if (!before) return { ok: false, error: "Quote request not found." };

  if (assignedToId) {
    const rep = await prisma.user.findFirst({
      where: {
        id: assignedToId,
        isActive: true,
        role: { in: [Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT] },
      },
      select: { id: true },
    });
    if (!rep) {
      return { ok: false, error: "Assigned sales rep not found or not eligible." };
    }
  }

  const after = await prisma.quoteRequest.update({
    where: { id },
    data: {
      status,
      assignedToId: assignedToId === undefined ? undefined : assignedToId,
    },
    select: { id: true, status: true, assignedToId: true },
  });

  await writeAuditLog({
    userId: actorId(session),
    action: "UPDATE_QUOTE_REQUEST",
    entityType: "QuoteRequest",
    entityId: id,
    beforeJson: before,
    afterJson: after,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/quotes");
  return { ok: true };
}

// ─── Session ──────────────────────────────────────────────────────────────────

export async function adminSignOut(): Promise<void> {
  const { adminLogout } = await import("@/features/admin/login-actions");
  await adminLogout();
}
