import "server-only";

import type { Prisma } from "@prisma/client";

import { StockError, toUserFacingDbError, AppDbError } from "@/lib/db-errors";
import { ORDER_TX_OPTIONS, prisma } from "@/lib/prisma";

import type {
  CheckoutAddress,
  OrderListItemDTO,
  OrderListResult,
  OrderSummaryDTO,
  PaymentMethod,
} from "./types";

// ─── Select shapes (single round-trip, no over-fetch) ─────────────────────────

const orderListSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  total: true,
  shipping: true,
  paymentMethod: true,
  bkashSenderNumber: true,
  bkashTrxId: true,
  createdAt: true,
  orderItems: {
    select: {
      id: true,
      qty: true,
      total: true,
      product: { select: { name: true } },
      variant: { select: { name: true } },
    },
    // List UIs only preview a couple of lines — cap payload size
    take: 5,
  },
  _count: { select: { orderItems: true } },
} satisfies Prisma.OrderSelect;

const orderDetailSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  subtotal: true,
  shipping: true,
  tax: true,
  total: true,
  paymentMethod: true,
  deliveryOption: true,
  installationOption: true,
  bkashSenderNumber: true,
  bkashTrxId: true,
  paidAt: true,
  createdAt: true,
  address: {
    select: {
      recipientName: true,
      phone: true,
      line1: true,
      line2: true,
      city: true,
      district: true,
      postCode: true,
    },
  },
  orderItems: {
    select: {
      id: true,
      qty: true,
      unitPrice: true,
      total: true,
      product: { select: { name: true, sku: true } },
      variant: { select: { name: true, sku: true } },
    },
  },
} satisfies Prisma.OrderSelect;

function toNum(d: unknown): number {
  return d ? Number(d) : 0;
}

type ListRow = Prisma.OrderGetPayload<{ select: typeof orderListSelect }>;
type DetailRow = Prisma.OrderGetPayload<{ select: typeof orderDetailSelect }>;

function toListDTO(order: ListRow): OrderListItemDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as OrderListItemDTO["status"],
    paymentStatus: (order.paymentStatus ?? "PENDING") as OrderListItemDTO["paymentStatus"],
    total: toNum(order.total),
    shipping: toNum(order.shipping),
    paymentMethod: (order.paymentMethod ?? null) as OrderListItemDTO["paymentMethod"],
    bkashSenderNumber: order.bkashSenderNumber,
    bkashTrxId: order.bkashTrxId,
    createdAt: order.createdAt.toISOString(),
    itemCount: order._count.orderItems,
    items: order.orderItems.map((oi) => ({
      id: oi.id,
      name: oi.product.name,
      variantName: oi.variant?.name ?? null,
      qty: oi.qty,
      total: toNum(oi.total),
    })),
  };
}

function toDetailDTO(order: DetailRow): OrderSummaryDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as OrderSummaryDTO["status"],
    paymentStatus: (order.paymentStatus ?? "PENDING") as OrderSummaryDTO["paymentStatus"],
    subtotal: toNum(order.subtotal),
    shipping: toNum(order.shipping),
    tax: toNum(order.tax),
    total: toNum(order.total),
    paymentMethod: (order.paymentMethod ?? null) as OrderSummaryDTO["paymentMethod"],
    deliveryOption: (order.deliveryOption ?? null) as OrderSummaryDTO["deliveryOption"],
    installationOption:
      (order.installationOption ?? null) as OrderSummaryDTO["installationOption"],
    bkashSenderNumber: order.bkashSenderNumber,
    bkashTrxId: order.bkashTrxId,
    paidAt: order.paidAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    address: order.address
      ? {
          recipientName: order.address.recipientName,
          phone: order.address.phone,
          line1: order.address.line1,
          line2: order.address.line2 ?? undefined,
          city: order.address.city,
          district: order.address.district,
          postCode: order.address.postCode ?? undefined,
        }
      : null,
    items: order.orderItems.map((oi) => ({
      id: oi.id,
      name: oi.product.name,
      variantName: oi.variant?.name ?? null,
      sku: oi.variant?.sku ?? oi.product.sku,
      qty: oi.qty,
      unitPrice: toNum(oi.unitPrice),
      total: toNum(oi.total),
    })),
  };
}

// ─── Create order (atomic) ────────────────────────────────────────────────────

export type CreateOrderLineInput = {
  productId: string;
  variantId: string | null;
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
};

export type CreateOrderRecordInput = {
  userId: string;
  orderNumber: string;
  transactionRef: string;
  address: CheckoutAddress;
  deliveryOption: string;
  installationOption: string;
  paymentMethod: PaymentMethod;
  bkashSenderNumber?: string | null;
  bkashTrxId?: string | null;
  notes?: string | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: CreateOrderLineInput[];
};

export type CreatedOrderRef = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: Prisma.Decimal;
  paymentMethod: string | null;
};

/**
 * Creates address + order + order items and decrements stock in one transaction.
 * Any failure (including insufficient stock) rolls everything back.
 */
export async function createOrderRecord(
  input: CreateOrderRecordInput,
): Promise<CreatedOrderRef> {
  try {
    return await prisma.$transaction(async (tx) => {
      // ── Batch stock reads ────────────────────────────────────────────
      const productIds = [
        ...new Set(
          input.items.filter((i) => !i.variantId).map((i) => i.productId),
        ),
      ];
      const variantIds = [
        ...new Set(
          input.items
            .map((i) => i.variantId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];

      const [products, variants] = await Promise.all([
        productIds.length
          ? tx.product.findMany({
              where: { id: { in: productIds } },
              select: { id: true, name: true, stock: true },
            })
          : Promise.resolve([]),
        variantIds.length
          ? tx.productVariant.findMany({
              where: { id: { in: variantIds } },
              select: { id: true, name: true, stock: true },
            })
          : Promise.resolve([]),
      ]);

      const productById = new Map(products.map((p) => [p.id, p]));
      const variantById = new Map(variants.map((v) => [v.id, v]));

      // ── Atomic stock decrements (race-safe) ──────────────────────────
      for (const item of input.items) {
        if (item.variantId) {
          const current = variantById.get(item.variantId);
          const result = await tx.productVariant.updateMany({
            where: { id: item.variantId, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } },
          });
          if (result.count === 0) {
            throw new StockError(item.name, current?.stock ?? 0);
          }
        } else {
          const current = productById.get(item.productId);
          const result = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } },
          });
          if (result.count === 0) {
            throw new StockError(item.name, current?.stock ?? 0);
          }
        }
      }

      const addressRecord = await tx.address.create({
        data: {
          userId: input.userId,
          label: "Order Address",
          recipientName: input.address.recipientName,
          phone: input.address.phone,
          line1: input.address.line1,
          line2: input.address.line2 || null,
          city: input.address.city,
          district: input.address.district,
          postCode: input.address.postCode || null,
        },
        select: { id: true },
      });

      return tx.order.create({
        data: {
          orderNumber: input.orderNumber,
          userId: input.userId,
          addressId: addressRecord.id,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal: input.subtotal,
          shipping: input.shipping,
          tax: input.tax,
          total: input.total,
          deliveryOption: input.deliveryOption,
          installationOption: input.installationOption,
          paymentMethod: input.paymentMethod,
          bkashSenderNumber:
            input.paymentMethod === "BKASH"
              ? input.bkashSenderNumber || null
              : null,
          bkashTrxId:
            input.paymentMethod === "BKASH" ? input.bkashTrxId || null : null,
          notes: input.notes || null,
          transactionRef: input.transactionRef,
          orderItems: {
            create: input.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              qty: item.qty,
              unitPrice: item.unitPrice,
              total: item.subtotal,
            })),
          },
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          paymentMethod: true,
        },
      });
    }, ORDER_TX_OPTIONS);
  } catch (err) {
    throw toUserFacingDbError(err);
  }
}

// ─── List / track (paginated, lean) ───────────────────────────────────────────

export type ListUserOrdersOptions = {
  page?: number;
  pageSize?: number;
};

/**
 * User order history / track-order list.
 * One query for rows + one for count; nested items limited via `take`.
 */
export async function listUserOrders(
  userId: string,
  options: ListUserOrdersOptions = {},
): Promise<OrderListResult> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 10));
  const skip = (page - 1) * pageSize;

  try {
    const where = { userId };

    const [total, rows] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: orderListSelect,
      }),
    ]);

    return {
      items: rows.map(toListDTO),
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (err) {
    throw toUserFacingDbError(err);
  }
}

/**
 * Full order detail for confirmation / track detail pages (ownership-scoped).
 */
export async function getUserOrderDetail(
  orderId: string,
  userId: string,
): Promise<OrderSummaryDTO | null> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: orderDetailSelect,
    });
    return order ? toDetailDTO(order) : null;
  } catch (err) {
    throw toUserFacingDbError(err);
  }
}

export async function getOrderByTransactionRef(
  ref: string,
): Promise<{ id: string; status: string; userId: string } | null> {
  try {
    return await prisma.order.findUnique({
      where: { transactionRef: ref },
      select: { id: true, status: true, userId: true },
    });
  } catch (err) {
    throw toUserFacingDbError(err);
  }
}

export async function cancelUserOrder(
  orderId: string,
  userId: string,
): Promise<{ id: string; previousStatus: string }> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: { id: true, status: true },
    });

    if (!order) {
      throw new AppDbError("Order not found.", "NOT_FOUND", 404);
    }

    if (
      order.status === "PAID" ||
      order.status === "SHIPPED" ||
      order.status === "DELIVERED"
    ) {
      throw new AppDbError(
        "This order cannot be cancelled.",
        "ORDER_LOCKED",
        400,
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
      select: { id: true },
    });

    return { id: order.id, previousStatus: order.status };
  } catch (err) {
    throw toUserFacingDbError(err);
  }
}
