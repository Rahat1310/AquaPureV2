import { z } from "zod";

// ─── Address ─────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  recipientName: z.string().min(2, "Full name is required."),
  phone: z
    .string()
    .min(7, "Enter a valid phone number.")
    .max(20, "Phone number is too long."),
  line1: z.string().min(5, "Shipping address is required."),
  line2: z.string().max(120).optional().or(z.literal("")),
  city: z.string().min(2, "City is required."),
  district: z.string().min(2, "District is required."),
  postCode: z.string().max(10).optional().or(z.literal("")),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ─── Create Order ─────────────────────────────────────────────────────────────

export const createOrderSchema = z
  .object({
    address: addressSchema,
    deliveryOption: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD"),
    installationOption: z.enum(["SELF", "SCHEDULED"]).default("SELF"),
    paymentMethod: z.enum(["COD", "BKASH"]).default("COD"),
    bkashSenderNumber: z.string().max(20).optional().or(z.literal("")),
    bkashTrxId: z.string().max(40).optional().or(z.literal("")),
    notes: z.string().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== "BKASH") return;

    if (!data.bkashSenderNumber || data.bkashSenderNumber.trim().length < 11) {
      ctx.addIssue({
        code: "custom",
        path: ["bkashSenderNumber"],
        message: "বিকাশ নাম্বার দিন (১১ ডিজিট)।",
      });
    }
    if (!data.bkashTrxId || data.bkashTrxId.trim().length < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["bkashTrxId"],
        message: "ট্রানজেকশন আইডি (TrxID) দিন।",
      });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/** Fixed COD delivery charge (BDT). bKash prepaid orders ship free. */
export const COD_DELIVERY_CHARGE = 100;
export const BKASH_DELIVERY_CHARGE = 0;
