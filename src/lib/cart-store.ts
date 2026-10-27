import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./mock-data";

export type CartItem = {
  cartItemId: string; // Unique ID for this specific variant combination
  id: string; // Base product ID
  name: string;
  slug: string;
  price: number;
  image: string;
  qty: number;
  weight?: number;
  selectedOptions?: Record<string, string>;
  maxStock?: number;
};

type CartState = {
  items: CartItem[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  add: (p: Product, qty?: number, selectedOptions?: Record<string, string>) => void;
  remove: (cartItemId: string) => void;
  setQty: (cartItemId: string, qty: number) => void;
  clear: () => void;
  updateItemStockLimits: (stockMap: Record<string, number>) => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      add: (p, qty = 1, selectedOptions) =>
        set((s) => {
          const cartItemId = `${p.id}-${selectedOptions ? Object.entries(selectedOptions).sort().map(([k, v]) => `${k}:${v}`).join("|") : "base"}`;
          const found = s.items.find((i) => i.cartItemId === cartItemId);
          const itemWeight = p.weight !== undefined && p.weight !== null ? Number(p.weight) : undefined;
          
          const selectedVariant = p.variants?.find((v) =>
            selectedOptions && Object.entries(selectedOptions).every(([k, val]) => v.options[k] === val)
          );
          const maxStock = p.variants && p.variants.length > 0
            ? Number(selectedVariant?.stock ?? 0)
            : Number(p.stock ?? 0);

          if (found)
            return {
              items: s.items.map((i) =>
                i.cartItemId === cartItemId
                  ? { ...i, qty, weight: itemWeight ?? i.weight, maxStock: maxStock ?? i.maxStock }
                  : i,
              ),
            };
          return {
            items: [
              ...s.items,
              {
                cartItemId,
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                image: p.images[0],
                qty,
                weight: itemWeight,
                selectedOptions,
                maxStock,
              },
            ],
          };
        }),
      remove: (cartItemId) => set((s) => ({ items: s.items.filter((i) => i.cartItemId !== cartItemId) })),
      setQty: (cartItemId, qty) =>
        set((s) => ({
          items: s.items.map((i) => {
            if (i.cartItemId !== cartItemId) return i;
            const capped = i.maxStock !== undefined && i.maxStock > 0 ? Math.min(qty, i.maxStock) : qty;
            return { ...i, qty: Math.max(1, capped) };
          }),
        })),
      clear: () => set({ items: [] }),
      updateItemStockLimits: (stockMap) =>
        set((s) => ({
          items: s.items.map((i) => {
            const newStock = stockMap[i.cartItemId] ?? stockMap[i.id];
            if (newStock !== undefined) {
              return { ...i, maxStock: newStock };
            }
            return i;
          }),
        })),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.qty * i.price, 0),
    }),
    {
      name: "eimah-cart",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function useCartHydrated() {
  const [mounted, setMounted] = useState(false);
  const storeHydrated = useCart((s) => s._hasHydrated);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && (storeHydrated || useCart.persist.hasHydrated());
}
