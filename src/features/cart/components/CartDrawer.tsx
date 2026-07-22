"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { CartSummary } from "@/features/cart/types";
import { useCart } from "@/features/cart/CartContext";
import { CartItemRow } from "./CartItemRow";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

interface CartDrawerProps {
  /** Pre-fetched from the Server Component layout */
  initialSummary: CartSummary;
}

export function CartDrawer({ initialSummary }: CartDrawerProps) {
  const { isSignedIn } = useAuth();
  const { drawerOpen, closeDrawer, totalQty } = useCart();
  const [summary, setSummary] = useState<CartSummary>(initialSummary);
  const [isFetching, startFetch] = useTransition();

  // Re-fetch cart summary whenever the drawer opens or totalQty changes
  useEffect(() => {
    if (!drawerOpen) return;
    startFetch(async () => {
      try {
        // We call the server query inline — Next.js server actions are fine here
        const res = await fetch("/api/cart/summary");
        if (res.ok) {
          const data = (await res.json()) as CartSummary;
          setSummary(data);
        }
      } catch {
        // Keep stale summary — non-fatal
      }
    });
  }, [drawerOpen, totalQty]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    if (drawerOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [drawerOpen, closeDrawer]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#f8faff] shadow-[−20px_0_60px_rgba(20,55,110,0.15)]"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-blue-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-primary" />
                <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                  Your Cart
                </h2>
                {summary.totalQty > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {summary.totalQty}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-secondary hover:text-primary"
                aria-label="Close cart"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isFetching && summary.items.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                  Loading…
                </div>
              ) : summary.items.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
                  <div className="grid size-16 place-items-center rounded-2xl bg-secondary text-primary">
                    <ShoppingBag className="size-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Your cart is empty</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Browse our products and add items here.
                    </p>
                  </div>
                  <Button variant="outline" onClick={closeDrawer}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.items.map((item) => (
                    <CartItemRow key={item.key} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {summary.items.length > 0 && (
              <div className="border-t border-blue-100 bg-white px-5 py-5">
                <div className="mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{BDT.format(summary.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-blue-100 pt-2 font-extrabold text-slate-900">
                    <span>Total</span>
                    <span className="text-primary">{BDT.format(summary.subtotal)}</span>
                  </div>
                </div>

                <Link
                  href={
                    isSignedIn
                      ? "/checkout"
                      : "/sign-in?redirect_url=/checkout"
                  }
                  onClick={closeDrawer}
                  className="block"
                >
                  <Button size="lg" className="w-full">
                    {isSignedIn ? "Proceed to Checkout" : "Sign in to Checkout"}
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="mt-2 w-full text-center text-sm font-medium text-slate-500 hover:text-primary"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
