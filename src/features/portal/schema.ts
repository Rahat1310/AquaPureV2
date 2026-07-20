import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1).max(40).default("Home"),
  recipientName: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  district: z.string().min(2).max(80),
  postCode: z.string().max(20).optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20).optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const wishlistToggleSchema = z.object({
  productId: z.string().cuid(),
});
