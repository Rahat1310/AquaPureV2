// ─── Checkout Types ───────────────────────────────────────────────────────────

export type DeliveryOption = "STANDARD" | "EXPRESS";
export type InstallationOption = "SELF" | "SCHEDULED";
export type PaymentMethod = "COD" | "BKASH" | "SSLCOMMERZ";
export type PaymentStatus = "PENDING" | "PAID";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface CheckoutAddress {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  district: string;
  postCode?: string;
}

export interface OrderLineDTO {
  id: string;
  name: string;
  variantName: string | null;
  sku: string;
  qty: number;
  unitPrice: number;
  total: number;
}

/** Lean list row for /orders and /track-order (no address, capped item preview). */
export interface OrderListItemDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  shipping: number;
  paymentMethod: PaymentMethod | null;
  bkashSenderNumber: string | null;
  bkashTrxId: string | null;
  createdAt: string;
  itemCount: number;
  items: Array<{
    id: string;
    name: string;
    variantName: string | null;
    qty: number;
    total: number;
  }>;
}

export interface OrderListResult {
  items: OrderListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface OrderSummaryDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod | null;
  deliveryOption: DeliveryOption | null;
  installationOption: InstallationOption | null;
  bkashSenderNumber: string | null;
  bkashTrxId: string | null;
  paidAt: string | null;
  createdAt: string;
  items: OrderLineDTO[];
  address: CheckoutAddress | null;
}

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | {
      ok: false;
      error: string;
      /** Zod field paths → messages (e.g. `bkashTrxId`, `address.phone`) */
      fieldErrors?: Record<string, string>;
    };
