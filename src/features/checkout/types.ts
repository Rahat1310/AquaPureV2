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
  | { ok: false; error: string };
