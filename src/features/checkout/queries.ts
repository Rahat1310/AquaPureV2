import "server-only";

/**
 * Public order query helpers — thin wrappers around the repository.
 * Prefer these from pages / actions so call sites stay stable.
 */

export {
  cancelUserOrder,
  createOrderRecord,
  getOrderByTransactionRef,
  getUserOrderDetail,
  listUserOrders,
  type CreateOrderLineInput,
  type CreateOrderRecordInput,
  type CreatedOrderRef,
  type ListUserOrdersOptions,
} from "./order-repository";

import { getUserOrderDetail, listUserOrders } from "./order-repository";
import type { OrderListItemDTO, OrderSummaryDTO } from "./types";

/** Detail fetch (confirmation, order detail pages). */
export async function getOrderById(
  orderId: string,
  userId: string,
): Promise<OrderSummaryDTO | null> {
  return getUserOrderDetail(orderId, userId);
}

/**
 * Back-compat list helper used by pages.
 * Defaults to first page of 20 — prefer `listUserOrders` for pagination.
 */
export async function getOrdersByUser(
  userId: string,
): Promise<OrderListItemDTO[]> {
  const result = await listUserOrders(userId, { page: 1, pageSize: 20 });
  return result.items;
}
