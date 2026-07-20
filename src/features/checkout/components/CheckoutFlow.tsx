"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Landmark,
  Lock,
  MapPin,
  Package,
} from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { createOrder } from "@/features/checkout/actions";
import { AddressForm } from "./AddressForm";
import { DeliveryOptions } from "./DeliveryOptions";
import { OrderSummary } from "./OrderSummary";

import type { CartSummary } from "@/features/cart/types";
import type { AddressInput } from "@/features/checkout/schema";
import type { DeliveryOption, InstallationOption, PaymentMethod } from "@/features/checkout/types";

type Step = 1 | 2 | 3;

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Delivery", icon: Package },
  { id: 3, label: "Review", icon: CreditCard },
];

interface CheckoutFlowProps {
  cart: CartSummary;
}

export function CheckoutFlow({ cart }: CheckoutFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<AddressInput | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("STANDARD");
  const [installationOption, setInstallationOption] = useState<InstallationOption>("SELF");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddressSubmit = (data: AddressInput) => {
    setAddress(data);
    setStep(2);
  };

  const handlePlaceOrder = () => {
    if (!address) return;
    setServerError(null);

    startTransition(async () => {
      const result = await createOrder({
        address,
        deliveryOption,
        installationOption,
        paymentMethod,
      });

      if (result.ok) {
        router.push(`/checkout/confirmation/${result.orderId}`);
      } else {
        setServerError(result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Step indicator */}
      <nav aria-label="Checkout steps" className="mb-8 flex items-center gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`grid size-10 place-items-center rounded-full border-2 transition-all ${
                    isDone
                      ? "border-primary bg-primary text-white"
                      : isActive
                        ? "border-primary bg-white text-primary shadow-[0_0_0_4px_rgba(27,79,209,0.1)]"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <Icon className="size-4.5" />
                  )}
                </div>
                <span
                  className={`text-xs font-semibold ${isActive ? "text-primary" : isDone ? "text-slate-700" : "text-slate-400"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 self-start mt-5 transition-colors ${step > s.id ? "bg-primary" : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main content */}
        <div>
          <AnimatePresence mode="wait">
            {/* ── Step 1: Address ─────────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="mb-6 text-xl font-extrabold tracking-tight text-slate-900">
                  Delivery Address
                </h2>
                <AddressForm
                  formId="step1-form"
                  defaultValues={address ?? undefined}
                  onSubmit={handleAddressSubmit}
                />
                <div className="mt-6">
                  <Button
                    type="submit"
                    form="step1-form"
                    size="lg"
                    className="w-full sm:w-auto"
                    id="next-to-delivery"
                  >
                    Continue to Delivery <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Delivery ─────────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="mb-6 text-xl font-extrabold tracking-tight text-slate-900">
                  Delivery & Installation
                </h2>
                <DeliveryOptions
                  deliveryOption={deliveryOption}
                  installationOption={installationOption}
                  onDeliveryChange={setDeliveryOption}
                  onInstallationChange={setInstallationOption}
                />
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    id="back-to-address"
                  >
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setStep(3)}
                    id="next-to-review"
                  >
                    Review Order <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Review & Payment ─────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="mb-6 text-xl font-extrabold tracking-tight text-slate-900">
                  Review & Payment
                </h2>

                {/* Address recap */}
                {address && (
                  <div className="mb-6 rounded-2xl border border-blue-100 bg-[#f8faff] p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
                        Delivering to
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{address.recipientName}</p>
                    <p className="text-sm text-slate-600">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ""},{" "}
                      {address.city}, {address.district}
                    </p>
                    <p className="text-sm text-slate-600">{address.phone}</p>
                  </div>
                )}

                {/* Payment method */}
                <div className="mb-6">
                  <p className="mb-3 text-sm font-bold text-slate-900">Payment Method</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      id="payment-cod"
                      onClick={() => setPaymentMethod("COD")}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                        paymentMethod === "COD"
                          ? "border-primary bg-secondary/50 shadow-[0_0_0_4px_rgba(27,79,209,0.08)]"
                          : "border-border bg-white hover:border-primary/30"
                      }`}
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                          paymentMethod === "COD"
                            ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Landmark className="size-4.5" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-slate-900">
                          Cash on Delivery
                        </span>
                        <span className="text-xs text-slate-500">Pay when you receive</span>
                      </span>
                    </button>

                    {/* SSLCommerz — stub, coming soon */}
                    <div
                      className="relative flex items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 opacity-60"
                      title="Coming soon"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400">
                        <CreditCard className="size-4.5" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-slate-500">
                          SSLCommerz
                        </span>
                        <span className="text-xs text-slate-400">Credit / Debit / Mobile Banking</span>
                      </span>
                      <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>

                {serverError && (
                  <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {serverError}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(2)}
                    disabled={isPending}
                    id="back-to-delivery"
                  >
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isPending}
                    className="flex-1"
                    id="place-order-btn"
                  >
                    {isPending ? (
                      "Placing Order…"
                    ) : (
                      <>
                        <Lock className="mr-2 size-4" />
                        Place Order
                      </>
                    )}
                  </Button>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock className="size-3" />
                  Your order is secured and encrypted.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: order summary */}
        <div>
          <OrderSummary cart={cart} deliveryOption={deliveryOption} />
        </div>
      </div>
    </div>
  );
}
