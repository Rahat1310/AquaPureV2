"use client";

import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/features/cart/actions";
import { useCart } from "@/features/cart/CartContext";
import type { ProductVariantDTO } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

export function ProductPurchasePanel({
  basePrice,
  stock,
  variants,
  productId,
}: {
  basePrice: number;
  stock: number;
  variants: ProductVariantDTO[];
  productId: string;
}) {
  const router = useRouter();
  const { setTotalQty, openDrawer } = useCart();

  const [variantId, setVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null,
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeVariant = variants.find((v) => v.id === variantId) ?? null;
  const price = activeVariant?.price ?? basePrice;
  const inStock = (activeVariant?.stock ?? stock) > 0;

  const handleAdd = () => {
    setError(null);
    startTransition(async () => {
      const result = await addToCart({ productId, variantId, qty });
      if (result.ok) {
        setTotalQty(result.totalQty);
        setAdded(true);
        openDrawer();
        window.setTimeout(() => setAdded(false), 2000);
      } else {
        setError(result.error);
      }
    });
  };

  const handleBuyNow = () => {
    setError(null);
    startTransition(async () => {
      const result = await addToCart({ productId, variantId, qty });
      if (result.ok) {
        setTotalQty(result.totalQty);
        router.push("/checkout");
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-5">
      {variants.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-slate-900">Capacity</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setVariantId(variant.id)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                  variant.id === variantId
                    ? "border-primary bg-secondary text-primary"
                    : "border-border bg-white text-slate-600 hover:border-primary/40",
                )}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold tracking-tight text-primary">
          {BDT.format(price)}
        </span>
        <span
          className={cn(
            "text-sm font-semibold",
            inStock ? "text-emerald-600" : "text-rose-600",
          )}
        >
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-xl border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-11 place-items-center text-slate-600 hover:text-primary"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-bold">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="grid size-11 place-items-center text-slate-600 hover:text-primary"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <span className="text-sm text-slate-500">
          Subtotal:{" "}
          <span className="font-bold text-slate-900">{BDT.format(price * qty)}</span>
        </span>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          size="lg"
          disabled={!inStock || isPending}
          onClick={handleAdd}
          id="add-to-cart-btn"
        >
          {added ? (
            <>
              <Check className="size-4" /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="size-4" /> Add to Cart
            </>
          )}
        </Button>
        <Button
          size="lg"
          disabled={!inStock || isPending}
          onClick={handleBuyNow}
          id="buy-now-btn"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
