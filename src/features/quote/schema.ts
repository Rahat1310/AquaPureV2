import { z } from "zod";

/** Reject email-header injection (CR/LF) and control chars. */
const NO_HEADER_INJECTION = /^[^\r\n\x00-\x1f\x7f]*$/;

/** Strip simple HTML / script payloads from free-text fields. */
function sanitizeText(value: string): string {
  return value
    .replace(/<\s*script[\s\S]*?>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

const textField = (max: number, tooLong: string) =>
  z
    .string()
    .trim()
    .max(max, tooLong)
    .refine((v) => NO_HEADER_INJECTION.test(v), {
      message: "Invalid characters in field.",
    })
    .transform(sanitizeText);

export const quoteRequestSchema = z.object({
  name: textField(80, "Name is too long.").refine((v) => v.length >= 2, {
    message: "Please enter your name.",
  }),
  company: textField(120, "Company is too long.")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number.")
    .max(20, "Phone number is too long.")
    .refine((v) => NO_HEADER_INJECTION.test(v), {
      message: "Invalid phone number.",
    })
    .refine((v) => /^[\d+\-\s()]+$/.test(v), {
      message: "Please enter a valid phone number.",
    }),
  email: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .max(120)
        .email("Enter a valid email.")
        .refine((v) => NO_HEADER_INJECTION.test(v), {
          message: "Invalid email address.",
        }),
    ])
    .optional(),
  requirement: textField(2000, "Requirement is too long.").refine(
    (v) => v.length >= 5,
    { message: "Tell us a little about your requirement." },
  ),
  capacityNeeded: textField(100, "Capacity is too long.")
    .optional()
    .or(z.literal("")),
  /** Honeypot — bots fill this; humans leave empty (validated server-side). */
  _website: z.string().max(200).optional().or(z.literal("")),
  /** Client form-open timestamp (ms) for timing check */
  _formOpenedAt: z.number().int().positive().optional(),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export type QuoteRequestResult =
  | { ok: true }
  | { ok: false; error: string };

/** Minimum time a real user typically needs to fill the form (ms). */
export const INQUIRY_MIN_FILL_MS = 2000;
