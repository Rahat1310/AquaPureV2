import { z } from "zod";

/** BD mobile: 01XXXXXXXXX (11 digits). */
const bdPhoneRegex = /^01[3-9]\d{8}$/;

// ─── Address ─────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(2, "Full name is required.")
    .max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .regex(bdPhoneRegex, "Enter a valid BD mobile (01XXXXXXXXX)."),
  line1: z
    .string()
    .trim()
    .min(5, "Shipping address is required.")
    .max(200, "Address is too long."),
  line2: z
    .string()
    .trim()
    .max(120, "Address line 2 is too long.")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().min(2, "City is required.").max(60),
  district: z.string().trim().min(2, "District is required.").max(60),
  postCode: z
    .string()
    .trim()
    .max(10)
    .optional()
    .or(z.literal("")),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ─── Create Order ─────────────────────────────────────────────────────────────

export const createOrderSchema = z
  .object({
    address: addressSchema,
    deliveryOption: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD"),
    installationOption: z.enum(["SELF", "SCHEDULED"]).default("SELF"),
    paymentMethod: z.enum(["COD", "BKASH"]),
    bkashSenderNumber: z
      .string()
      .trim()
      .max(20)
      .optional()
      .or(z.literal("")),
    bkashTrxId: z
      .string()
      .trim()
      .max(40)
      .optional()
      .or(z.literal("")),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== "BKASH") return;

    const sender = data.bkashSenderNumber?.trim() ?? "";
    const trx = data.bkashTrxId?.trim() ?? "";

    if (!bdPhoneRegex.test(sender)) {
      ctx.addIssue({
        code: "custom",
        path: ["bkashSenderNumber"],
        message: "বিকাশ নাম্বার দিন (১১ ডিজিট, 01XXXXXXXXX)।",
      });
    }

    if (trx.length < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["bkashTrxId"],
        message: "ট্রানজেকশন আইডি (TrxID) দিন।",
      });
    } else if (!/^[A-Za-z0-9_-]+$/.test(trx)) {
      ctx.addIssue({
        code: "custom",
        path: ["bkashTrxId"],
        message: "TrxID শুধু অক্ষর/সংখ্যা হতে পারে।",
      });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/** Fixed COD delivery charge (BDT). bKash prepaid orders ship free. */
export const COD_DELIVERY_CHARGE = 100;
export const BKASH_DELIVERY_CHARGE = 0;
