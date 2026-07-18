import { prisma } from "@/lib/prisma";

interface AuditParams {
  userId: string;
  action: string;      // e.g. "CREATE_PRODUCT", "UPDATE_ORDER_STATUS", "DELETE_CATEGORY"
  entityType: string;  // e.g. "Product", "Order", "Category"
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

/**
 * Write an audit log entry for any admin mutation.
 *
 * Call this inside every Server Action that mutates products, prices, or orders.
 *
 * @example
 * await logAudit({
 *   userId: session.user.id,
 *   action: "UPDATE_PRODUCT_PRICE",
 *   entityType: "Product",
 *   entityId: product.id,
 *   before: { price: product.price },
 *   after:  { price: newPrice },
 * });
 */
export async function logAudit({
  userId,
  action,
  entityType,
  entityId,
  before = null,
  after = null,
}: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      beforeJson: before ? JSON.stringify(before) : null,
      afterJson: after ? JSON.stringify(after) : null,
    },
  });
}
