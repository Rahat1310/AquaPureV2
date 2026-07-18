"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createQuoteRequest } from "@/features/quote/actions";
import {
  quoteRequestSchema,
  type QuoteRequestInput,
} from "@/features/quote/schema";

interface QuoteRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRequirement?: string;
  title?: string;
}

export function QuoteRequestDialog({
  open,
  onOpenChange,
  defaultRequirement = "",
  title = "Get a free consultation",
}: QuoteRequestDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: { requirement: defaultRequirement },
  });

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setServerError(null);
      reset({ requirement: defaultRequirement, name: "", phone: "", company: "", email: "" });
    }
  }, [open, defaultRequirement, reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const onSubmit = (values: QuoteRequestInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createQuoteRequest(values);
      if (result.ok) setSubmitted(true);
      else setServerError(result.error);
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-blue-100 bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-secondary hover:text-primary"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
            <h2 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900">
              Request received!
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Thank you. Our team will contact you within 48 hours to schedule your consultation.
            </p>
            <Button className="mt-6" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Share your requirement and we&apos;ll prepare a tailored quote.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3" noValidate>
              <div>
                <Input placeholder="Full name *" aria-label="Full name" {...register("name")} />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Input placeholder="Phone *" aria-label="Phone" {...register("phone")} />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>
                  )}
                </div>
                <Input placeholder="Company (optional)" aria-label="Company" {...register("company")} />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  aria-label="Email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <textarea
                  placeholder="Tell us about your requirement *"
                  aria-label="Requirement"
                  rows={4}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  {...register("requirement")}
                />
                {errors.requirement && (
                  <p className="mt-1 text-xs text-rose-600">{errors.requirement.message}</p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-rose-600">{serverError}</p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending ? "Submitting…" : "Request Consultation"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
