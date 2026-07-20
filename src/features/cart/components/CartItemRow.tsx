"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";

import { removeFromCart, updateQuantity } from "@/features/cart/actions";
import { useCart } from "@/features/cart/CartContext";
import type { CartLineItem } from "@/features/cart/types";
import { cn } from "@/lib/utils";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

interface CartItemRowProps {
  item: CartLineItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { setTotalQty } = useCart();
  const [isPending, startTransition] = useTransition();

  const handleQty = (delta: number) => {
    const newQty = item.qty + delta;
    startTransition(async () => {
      const result = await updateQuantity({
        productId: item.productId,
        variantId: item.variantId,
        qty: newQty,
      });
      if (result.ok) setTotalQty(result.totalQty);
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeFromCart({
        productId: item.productId,
        variantId: item.variantId,
      });
      if (result.ok) setTotalQty(result.totalQty);
    });
  };

  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border border-blue-50 bg-white p-3 transition-opacity",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      {/* Product image */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="grid size-full place-items-center text-[10px] font-semibold text-slate-400">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {item.name}
        </p>
        {item.variantName && (
          <p className="text-xs text-slate-500">{item.variantName}</p>
        )}
        <p className="mt-0.5 text-sm font-bold text-primary">
          {BDT.format(item.unitPrice)}
        </p>

        {/* Qty controls */}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => handleQty(-1)}
            disabled={item.qty <= 1}
            className="grid size-7 place-items-center rounded-lg border border-border text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-40"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => handleQty(1)}
            disabled={item.qty >= item.stock}
            className="grid size-7 place-items-center rounded-lg border border-border text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-40"
          >
            <Plus className="size-3.5" />
          </button>
          <span className="ml-auto text-sm font-semibold text-slate-700">
            {BDT.format(item.subtotal)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        onClick={handleRemove}
        className="self-start rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
