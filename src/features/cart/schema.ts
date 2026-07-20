import { z } from "zod";

// ─── Add to Cart ──────────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required."),
  variantId: z.string().nullable().optional(),
  qty: z.number().int().min(1).max(100).default(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

// ─── Update Quantity ──────────────────────────────────────────────────────────

export const updateQuantitySchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  qty: z.number().int().min(0).max(100), // 0 = remove
});

export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;

// ─── Remove from Cart ─────────────────────────────────────────────────────────

export const removeFromCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
});

export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;

// ─── Shared result type ───────────────────────────────────────────────────────

export type CartActionResult =
  | { ok: true; totalQty: number }
  | { ok: false; error: string };
