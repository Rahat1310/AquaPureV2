"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Landmark,
  Lock,
  MapPin,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrder } from "@/features/checkout/actions";
import { AddressForm } from "./AddressForm";
import { OrderSummary } from "./OrderSummary";

import type { CartSummary } from "@/features/cart/types";
import type { AddressInput } from "@/features/checkout/schema";
import type { PaymentMethod } from "@/features/checkout/types";

type Step = 1 | 2;

const STEPS = [
  { id: 1, label: "Shipping", icon: MapPin },
  { id: 2, label: "Payment", icon: Wallet },
];

const BKASH_NUMBER =
  process.env.NEXT_PUBLIC_BKASH_NUMBER?.trim() || "01XXXXXXXXX";

interface CheckoutFlowProps {
  cart: CartSummary;
}

export function CheckoutFlow({ cart }: CheckoutFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<AddressInput | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [bkashSenderNumber, setBkashSenderNumber] = useState("");
  const [bkashTrxId, setBkashTrxId] = useState("");
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
        deliveryOption: "STANDARD",
        installationOption: "SELF",
        paymentMethod,
        bkashSenderNumber,
        bkashTrxId,
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
                  {isDone ? <CheckCircle2 className="size-5" /> : <Icon className="size-4.5" />}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isActive ? "text-primary" : isDone ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mt-5 h-0.5 flex-1 self-start transition-colors ${
                    step > s.id ? "bg-primary" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="mb-6 text-xl font-extrabold tracking-tight text-slate-900">
                  Shipping details
                </h2>
                <AddressForm
                  formId="step1-form"
                  defaultValues={address ?? undefined}
                  onSubmit={handleAddressSubmit}
                />
                <div className="mt-6">
                  <Button type="submit" form="step1-form" size="lg" className="w-full sm:w-auto">
                    Continue to Payment <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="mb-6 text-xl font-extrabold tracking-tight text-slate-900">
                  Payment method
                </h2>

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
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                      {address.district}
                    </p>
                    <p className="text-sm text-slate-600">{address.phone}</p>
                  </div>
                )}

                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
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
                      <span className="text-xs text-slate-500">
                        + BDT 100 delivery · pay on receive
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BKASH")}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                      paymentMethod === "BKASH"
                        ? "border-primary bg-secondary/50 shadow-[0_0_0_4px_rgba(27,79,209,0.08)]"
                        : "border-border bg-white hover:border-primary/30"
                    }`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                        paymentMethod === "BKASH"
                          ? "bg-[#E2136E] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Smartphone className="size-4.5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-900">bKash</span>
                      <span className="text-xs text-slate-500">
                        Full payment · free delivery
                      </span>
                    </span>
                  </button>
                </div>

                {paymentMethod === "BKASH" && (
                  <div className="mb-6 space-y-4 rounded-2xl border border-pink-100 bg-gradient-to-br from-[#fff5f9] to-white p-5">
                    <div className="rounded-xl border border-pink-100/80 bg-white/80 p-4 text-sm leading-7 text-slate-700">
                      <p className="mb-2 font-bold text-[#E2136E]">বিকাশ পেমেন্ট নির্দেশনা</p>
                      <p>
                        আমাদের বিকাশ মার্চেন্ট বা পার্সোনাল নাম্বারে{" "}
                        <span className="font-extrabold text-slate-900">({BKASH_NUMBER})</span>{" "}
                        টাকা <strong>Send Money</strong> করুন। এরপর আপনার বিকাশ নাম্বার এবং
                        ট্রানজেকশন আইডি (TrxID) নিচের বক্সে দিন।
                      </p>
                    </div>

                    <div>
                      <label
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                        htmlFor="bkash-sender"
                      >
                        আপনার বিকাশ নাম্বার *
                      </label>
                      <Input
                        id="bkash-sender"
                        value={bkashSenderNumber}
                        onChange={(e) => setBkashSenderNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                        htmlFor="bkash-trx"
                      >
                        ট্রানজেকশন আইডি (TrxID) *
                      </label>
                      <Input
                        id="bkash-trx"
                        value={bkashTrxId}
                        onChange={(e) => setBkashTrxId(e.target.value)}
                        placeholder="e.g. 8N7A2XXXXX"
                      />
                    </div>
                  </div>
                )}

                {serverError && (
                  <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {serverError}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    disabled={isPending}
                  >
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isPending}
                    className="flex-1"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <OrderSummary cart={cart} paymentMethod={paymentMethod} />
        </div>
      </div>
    </div>
  );
}
