"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

interface CartContextValue {
  /** Total number of items (qty) in cart */
  totalQty: number;
  /** Update qty after a server action completes */
  setTotalQty: (qty: number) => void;
  /** Whether the cart drawer is open */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue>({
  totalQty: 0,
  setTotalQty: () => undefined,
  drawerOpen: false,
  openDrawer: () => undefined,
  closeDrawer: () => undefined,
});

export function CartProvider({
  children,
  initialQty = 0,
}: {
  children: React.ReactNode;
  initialQty?: number;
}) {
  const [totalQty, setTotalQty] = useState(initialQty);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <CartContext.Provider
      value={{ totalQty, setTotalQty, drawerOpen, openDrawer, closeDrawer }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
