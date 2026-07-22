import "server-only";

import { prisma } from "@/lib/prisma";

import type { OrderStatus, OrderSummaryDTO } from "./types";

function toNum(d: unknown): number {
  return d ? parseFloat(String(d)) : 0;
}

// ─── Get single order (ownership-checked) ────────────────────────────────────

export async function getOrderById(
  orderId: string,
  userId: string,
): Promise<OrderSummaryDTO | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      address: true,
      orderItems: {
        include: {
          product: { select: { name: true, sku: true } },
          variant: { select: { name: true, sku: true } },
        },
      },
    },
  });

  if (!order) return null;
  return toDTO(order);
}

// ─── Get orders list for user ─────────────────────────────────────────────────

export async function getOrdersByUser(userId: string): Promise<OrderSummaryDTO[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      address: true,
      orderItems: {
        include: {
          product: { select: { name: true, sku: true } },
          variant: { select: { name: true, sku: true } },
        },
      },
    },
  });

  return orders.map(toDTO);
}

// ─── Get order by transactionRef (for webhook) ────────────────────────────────

export async function getOrderByTransactionRef(
  ref: string,
): Promise<{ id: string; status: string; userId: string } | null> {
  return prisma.order.findUnique({
    where: { transactionRef: ref },
    select: { id: true, status: true, userId: true },
  });
}

// ─── Serializer ───────────────────────────────────────────────────────────────

type PrismaOrderWithIncludes = Awaited<
  ReturnType<typeof prisma.order.findFirst>
> & {
  address: { recipientName: string; phone: string; line1: string; line2: string | null; city: string; district: string; postCode: string | null } | null;
  orderItems: {
    id: string;
    qty: number;
    unitPrice: unknown;
    total: unknown;
    product: { name: string; sku: string };
    variant: { name: string; sku: string } | null;
  }[];
};

function toDTO(order: NonNullable<PrismaOrderWithIncludes>): OrderSummaryDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as OrderStatus,
    paymentStatus: ((order as { paymentStatus?: string }).paymentStatus ??
      (order.status === "PAID" ? "PAID" : "PENDING")) as OrderSummaryDTO["paymentStatus"],
    subtotal: toNum(order.subtotal),
    shipping: toNum(order.shipping),
    tax: toNum(order.tax),
    total: toNum(order.total),
    paymentMethod: (order.paymentMethod ?? null) as OrderSummaryDTO["paymentMethod"],
    deliveryOption: (order.deliveryOption ?? null) as OrderSummaryDTO["deliveryOption"],
    installationOption: (order.installationOption ?? null) as OrderSummaryDTO["installationOption"],
    bkashSenderNumber: (order as { bkashSenderNumber?: string | null }).bkashSenderNumber ?? null,
    bkashTrxId: (order as { bkashTrxId?: string | null }).bkashTrxId ?? null,
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
