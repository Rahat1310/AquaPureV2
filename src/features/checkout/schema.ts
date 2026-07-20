import { z } from "zod";

// ─── Address ─────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  recipientName: z.string().min(2, "Recipient name is required."),
  phone: z
    .string()
    .min(7, "Enter a valid phone number.")
    .max(20, "Phone number is too long."),
  line1: z.string().min(5, "Street address is required."),
  line2: z.string().max(120).optional().or(z.literal("")),
  city: z.string().min(2, "City is required."),
  district: z.string().min(2, "District is required."),
  postCode: z.string().max(10).optional().or(z.literal("")),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ─── Delivery ─────────────────────────────────────────────────────────────────

export const deliverySchema = z.object({
  deliveryOption: z.enum(["STANDARD", "EXPRESS"]),
  installationOption: z.enum(["SELF", "SCHEDULED"]),
});

export type DeliveryInput = z.infer<typeof deliverySchema>;

// ─── Create Order ─────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  address: addressSchema,
  deliveryOption: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD"),
  installationOption: z.enum(["SELF", "SCHEDULED"]).default("SELF"),
  paymentMethod: z.enum(["COD", "SSLCOMMERZ"]).default("COD"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
