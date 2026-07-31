"use client";

import { useEffect, useRef } from "react";

import { useCart } from "@/features/cart/CartContext";
import type { CartSummary } from "@/features/cart/types";

const EMPTY: CartSummary = { items: [], totalQty: 0, subtotal: 0 };

/** Hydrates cart qty from `/api/cart/summary` on mount (layout stays static). */
export function CartBadge() {
  const { setTotalQty } = useCart();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/cart/summary", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = (await res.json()) as CartSummary;
        if (!cancelled) {
          setTotalQty(data.totalQty ?? EMPTY.totalQty);
        }
      } catch {
        // Non-fatal — badge stays at 0 until next cart mutation
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setTotalQty]);

  return null;
}
