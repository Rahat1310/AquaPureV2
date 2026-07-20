import { z } from "zod";

export const customerLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const staffLoginSchema = z.object({
  email: z.string().email("Please enter a valid staff email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
