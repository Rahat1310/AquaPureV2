"use client";

import type { CartSummary } from "@/features/cart/types";
import {
  BKASH_DELIVERY_CHARGE,
  COD_DELIVERY_CHARGE,
} from "@/features/checkout/schema";
import type { PaymentMethod } from "@/features/checkout/types";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

interface OrderSummaryProps {
  cart: CartSummary;
  paymentMethod: PaymentMethod;
}

export function OrderSummary({ cart, paymentMethod }: OrderSummaryProps) {
  const shipping =
    paymentMethod === "COD" ? COD_DELIVERY_CHARGE : BKASH_DELIVERY_CHARGE;
  const total = cart.subtotal + shipping;

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5">
      <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.1em] text-slate-500">
        Order Summary
      </h3>

      <div className="space-y-3">
        {cart.items.map((item) => (
          <div key={item.key} className="flex items-start gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
              {item.qty}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
              {item.variantName && (
                <p className="text-xs text-slate-500">{item.variantName}</p>
              )}
            </div>
            <span className="shrink-0 text-sm font-bold text-slate-900">
              {BDT.format(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2 border-t border-blue-50 pt-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold">{BDT.format(cart.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {paymentMethod === "COD" ? "Delivery (COD)" : "Delivery (bKash)"}
          </span>
          <span
            className={
              shipping === 0 ? "font-semibold text-emerald-600" : "font-semibold"
            }
          >
            {shipping === 0 ? "Free" : BDT.format(shipping)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-blue-100 pt-3 font-extrabold text-slate-900">
          <span className="text-base">Total</span>
          <span className="text-lg text-primary">{BDT.format(total)}</span>
        </div>
      </div>
    </div>
  );
}
