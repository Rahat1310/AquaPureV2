// ─── Cart Types ───────────────────────────────────────────────────────────────

/** A single item stored in the guest httpOnly cookie cart */
export interface GuestCartItem {
  productId: string;
  variantId: string | null;
  qty: number;
}

/** Enriched cart line for display — used by both DB and guest carts */
export interface CartLineItem {
  /** Unique key for this line: `${productId}:${variantId ?? ""}` */
  key: string;
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  sku: string;
  image: string | null;
  unitPrice: number;
  qty: number;
  stock: number;
  subtotal: number;
}

/** Aggregate cart summary */
export interface CartSummary {
  items: CartLineItem[];
  totalQty: number;
  subtotal: number;
}
