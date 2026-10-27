import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./mock-data";

type WishlistState = {
  items: Product[];
  toggle: (p: Product) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (p) =>
        set((s) => {
          const exists = s.items.some((i) => i.id === p.id);
          if (exists) {
            return { items: s.items.filter((i) => i.id !== p.id) };
          }
          return { items: [...s.items, p] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: "eimah-wishlist" }
  )
);
