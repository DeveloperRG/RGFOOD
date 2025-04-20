// src/providers/cart-provider.tsx
"use client";

import { CartProvider as CartContextProvider } from "~/hooks/use-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <CartContextProvider>{children}</CartContextProvider>;
}
