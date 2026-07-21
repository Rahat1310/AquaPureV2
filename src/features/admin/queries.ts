import "server-only";

import type { Prisma } from "@prisma/client";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { requireRole, Role } from "@/lib/rbac";

import { AdminPermission } from "./permissions";
import {
  auditFiltersSchema,
  listOrdersFilterSchema,
  listProductsFilterSchema,
  listQuotesFilterSchema,
  listUsersFilterSchema,
} from "./schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNumber(value: { toString(): string } | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function toNullableNumber(
  value: { toString(): string } | number | null | undefined,
): number | null {
  if (value === null || value === undefined) return null;
  return toNumber(value);
}

function parseImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

const DEFAULT_PAGE_SIZE = 20;

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getAdminDashboardStats() {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.DASHBOARD]);

  const [
    productCount,
    activeProductCount,
    orderCount,
    pendingOrders,
    revenueAgg,
    openServiceRequests,
    newQuotes,
    userCount,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.count({
      where: { status: { in: ["PENDING", "PAID", "PROCESSING"] } },
    }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
    prisma.serviceRequest.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    prisma.quoteRequest.count({ where: { status: "NEW" } }),
    prisma.user.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return {
    productCount,
    activeProductCount,
    orderCount,
    pendingOrders,
    revenue: toNumber(revenueAgg._sum.total),
    openServiceRequests,
    newQuotes,
    userCount,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: toNumber(o.total),
      createdAt: o.createdAt,
      customerName: o.user.name,
      customerEmail: o.user.email,
    })),
  };
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function listProducts(filters: unknown = {}) {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.PRODUCTS_READ]);

  const parsed = listProductsFilterSchema.safeParse(filters ?? {});
  const {
    q,
    status,
    categoryId,
    page,
    pageSize,
  } = parsed.success
    ? parsed.data
    : { q: undefined, status: undefined, categoryId: undefined, page: 1, pageSize: DEFAULT_PAGE_SIZE };

  const where: Prisma.ProductWhereInput = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
      { brand: { contains: term, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        compareAtPrice: true,
        stock: true,
        images: true,
        brand: true,
        status: true,
        isFeatured: true,
        isBestSeller: true,
        categoryId: true,
        category: { select: { id: true, name: true, slug: true } },
        updatedAt: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    items: rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      price: toNumber(p.price),
      compareAtPrice: toNullableNumber(p.compareAtPrice),
      stock: p.stock,
      images: parseImages(p.images),
      brand: p.brand,
      status: p.status,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      categoryId: p.categoryId,
      category: p.category,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    })),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductForEdit(id: string) {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.PRODUCTS_READ]);

  const product = await prisma.product.findUnique({
    where: { id },
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
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: toNumber(product.price),
    compareAtPrice: toNullableNumber(product.compareAtPrice),
    stock: product.stock,
    images: parseImages(product.images),
    brand: product.brand,
    status: product.status,
    categoryId: product.categoryId,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    category: product.category,
  };
}

export async function listCategories() {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.PRODUCTS_READ]);

  return prisma.category.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      displayOrder: true,
      _count: { select: { products: true } },
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function listOrders(filters: unknown = {}) {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.ORDERS]);

  const parsed = listOrdersFilterSchema.safeParse(filters ?? {});
  const { status, q, page } = parsed.success
    ? parsed.data
    : { status: undefined, q: undefined, page: 1 };
  const pageSize = DEFAULT_PAGE_SIZE;

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { user: { email: { contains: term, mode: "insensitive" } } },
      { user: { name: { contains: term, mode: "insensitive" } } },
      { transactionRef: { contains: term, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        paymentMethod: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { orderItems: true } },
      },
    }),
  ]);

  return {
    items: rows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: toNumber(o.total),
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      user: o.user,
      itemCount: o._count.orderItems,
    })),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getOrderAdmin(id: string) {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.ORDERS]);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      address: true,
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              images: true,
            },
          },
          variant: {
            select: { id: true, name: true, sku: true },
          },
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: toNumber(order.subtotal),
    shipping: toNumber(order.shipping),
    tax: toNumber(order.tax),
    total: toNumber(order.total),
    notes: order.notes,
    paidAt: order.paidAt,
    deliveryOption: order.deliveryOption,
    installationOption: order.installationOption,
    paymentMethod: order.paymentMethod,
    transactionRef: order.transactionRef,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: order.user,
    address: order.address,
    items: order.orderItems.map((item) => ({
      id: item.id,
      qty: item.qty,
      unitPrice: toNumber(item.unitPrice),
      total: toNumber(item.total),
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        images: parseImages(item.product.images),
      },
      variant: item.variant,
    })),
  };
}

// ─── Service requests ─────────────────────────────────────────────────────────

export async function listServiceRequests() {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.SERVICE_REQUESTS]);

  const rows = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true, email: true } },
    },
  });

  return rows;
}

export async function listTechnicians() {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.SERVICE_REQUESTS]);

  return prisma.user.findMany({
    where: {
      isActive: true,
      role: {
        in: [Role.SERVICE_MANAGER, Role.ADMIN, Role.SUPPORT, Role.SUPER_ADMIN],
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
    },
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listUsers(filters: unknown = {}) {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.USERS]);

  const parsed = listUsersFilterSchema.safeParse(filters ?? {});
  const { q, role, page } = parsed.success
    ? parsed.data
    : { q: undefined, role: undefined, page: 1 };
  const pageSize = DEFAULT_PAGE_SIZE;

  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;
  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    items: rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export async function listQuoteRequests(filters: unknown = {}) {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.QUOTES]);

  const parsed = listQuotesFilterSchema.safeParse(filters ?? {});
  const { status, q } = parsed.success
    ? parsed.data
    : { status: undefined, q: undefined };

  const where: Prisma.QuoteRequestWhereInput = {};
  if (status) where.status = status;
  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { company: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { requirement: { contains: term, mode: "insensitive" } },
    ];
  }

  return prisma.quoteRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });
}

export async function listSalesReps() {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.QUOTES]);

  return prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: [Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT] },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}

// ─── Audit logs ───────────────────────────────────────────────────────────────

export async function listAuditLogs(filters: unknown = {}) {
  const session = await getAdminSession();
  requireRole(session, [...AdminPermission.AUDIT]);

  const parsed = auditFiltersSchema.safeParse(filters ?? {});
  const { entityType, userId, q, page = 1 } = parsed.success
    ? { ...parsed.data, page: parsed.data.page ?? 1 }
    : { entityType: undefined, userId: undefined, q: undefined, page: 1 };
  const pageSize = DEFAULT_PAGE_SIZE;

  const where: Prisma.AuditLogWhereInput = {};
  if (entityType?.trim()) where.entityType = entityType.trim();
  if (userId) where.userId = userId;
  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { action: { contains: term, mode: "insensitive" } },
      { entityType: { contains: term, mode: "insensitive" } },
      { entityId: { contains: term, mode: "insensitive" } },
      { user: { email: { contains: term, mode: "insensitive" } } },
      { user: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
  ]);

  return {
    items: rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
