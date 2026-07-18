import { z } from "zod";

export const quoteRequestSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  company: z.string().max(120).optional().or(z.literal("")),
  phone: z
    .string()
    .min(6, "Please enter a valid phone number.")
    .max(20, "Phone number is too long."),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  requirement: z.string().min(5, "Tell us a little about your requirement."),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export type QuoteRequestResult =
  | { ok: true }
  | { ok: false; error: string };
