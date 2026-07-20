import { z } from "zod";

// ─── Shared enums ─────────────────────────────────────────────────────────────

export const productStatusSchema = z.enum(["ACTIVE", "DRAFT", "DISCONTINUED"]);
export const orderStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);
export const serviceRequestStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
export const userRoleSchema = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "SERVICE_MANAGER",
  "SUPPORT",
  "CUSTOMER",
]);
export const quoteStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "CLOSED_WON",
  "CLOSED_LOST",
]);

// ─── Product ──────────────────────────────────────────────────────────────────

const productFields = {
  name: z.string().min(2, "Name is required.").max(200),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case."),
  sku: z.string().min(1, "SKU is required.").max(80),
  description: z.string().max(10000).optional().nullable(),
  price: z.number().positive("Price must be positive."),
  compareAtPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().min(1)).default([]),
  brand: z.string().max(120).optional().nullable(),
  status: productStatusSchema.default("DRAFT"),
  categoryId: z.string().cuid(),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
};

export const createProductSchema = z.object(productFields);
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  id: z.string().cuid(),
  ...productFields,
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const bulkProductActionSchema = z
  .object({
    productIds: z.array(z.string().cuid()).min(1),
    action: z.enum(["delete", "status"]),
    status: productStatusSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.action === "status" && !val.status) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Status is required when action is status.",
        path: ["status"],
      });
    }
  });
export type BulkProductActionInput = z.infer<typeof bulkProductActionSchema>;

export const updateStockSchema = z.object({
  productId: z.string().cuid(),
  stock: z.number().int().nonnegative(),
});
export type UpdateStockInput = z.infer<typeof updateStockSchema>;

/** Kept for the existing pricing action. */
export const updatePriceSchema = z.object({
  productId: z.string().cuid(),
  price: z.number().positive(),
  compareAtPrice: z.number().nullable().optional(),
});
export type UpdatePriceInput = z.infer<typeof updatePriceSchema>;

// ─── Orders ───────────────────────────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid(),
  status: orderStatusSchema,
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const initiateRefundSchema = z.object({
  orderId: z.string().cuid(),
  reason: z.string().min(3, "Refund reason is required.").max(1000),
});
export type InitiateRefundInput = z.infer<typeof initiateRefundSchema>;

// ─── Service requests ─────────────────────────────────────────────────────────

export const updateServiceRequestSchema = z.object({
  id: z.string().cuid(),
  status: serviceRequestStatusSchema,
  technicianId: z.string().cuid().optional().nullable(),
});
export type UpdateServiceRequestInput = z.infer<
  typeof updateServiceRequestSchema
>;

// ─── Users ────────────────────────────────────────────────────────────────────

export const updateUserSchema = z.object({
  id: z.string().cuid(),
  role: userRoleSchema,
  isActive: z.boolean(),
  twoFactorEnabled: z.boolean(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ─── Quotes ───────────────────────────────────────────────────────────────────

export const updateQuoteRequestSchema = z.object({
  id: z.string().cuid(),
  status: quoteStatusSchema,
  assignedToId: z.string().cuid().optional().nullable(),
});
export type UpdateQuoteRequestInput = z.infer<typeof updateQuoteRequestSchema>;

// ─── Audit filters ────────────────────────────────────────────────────────────

export const auditFiltersSchema = z.object({
  entityType: z.string().max(80).optional(),
  userId: z.string().cuid().optional(),
  q: z.string().max(200).optional(),
  page: z.number().int().positive().optional(),
});
export type AuditFiltersInput = z.infer<typeof auditFiltersSchema>;

// ─── List / query filters (used by queries) ───────────────────────────────────

export const listProductsFilterSchema = z.object({
  q: z.string().max(200).optional(),
  status: productStatusSchema.optional(),
  categoryId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});
export type ListProductsFilter = z.infer<typeof listProductsFilterSchema>;

export const listOrdersFilterSchema = z.object({
  status: orderStatusSchema.optional(),
  q: z.string().max(200).optional(),
  page: z.number().int().positive().default(1),
});
export type ListOrdersFilter = z.infer<typeof listOrdersFilterSchema>;

export const listUsersFilterSchema = z.object({
  q: z.string().max(200).optional(),
  role: userRoleSchema.optional(),
  page: z.number().int().positive().default(1),
});
export type ListUsersFilter = z.infer<typeof listUsersFilterSchema>;

export const listQuotesFilterSchema = z.object({
  status: quoteStatusSchema.optional(),
  q: z.string().max(200).optional(),
});
export type ListQuotesFilter = z.infer<typeof listQuotesFilterSchema>;
