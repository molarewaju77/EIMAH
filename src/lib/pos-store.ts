import { create } from "zustand";
import type { Product } from "./mock-data";

export type PosCustomer = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

export type PosCartItem = {
  id: string;
  product: Product;
  qty: number;
  variant?: string;
  variantId?: string;
  customDiscount: number; // fixed amount off
};

type PosState = {
  customer: PosCustomer | null;
  items: PosCartItem[];
  shippingFee: number;
  globalDiscount: number;
  deliveryMethod: "Courier" | "Pickup Station";
  selectedPickupStationId: string;
  paymentStatus: "Paid" | "Partially Paid" | "Pay on Delivery" | "Pending Payment";
  paymentMethod: "Bank Transfer" | "Card" | "Cash" | "Wallet" | "Other" | "";
  internalNotes: string;
  
  // Actions
  setCustomer: (c: PosCustomer | null) => void;
  addItem: (p: Product, qty?: number, variant?: string, variantId?: string) => void;
  updateItemQty: (id: string, qty: number) => void;
  updateItemDiscount: (id: string, discount: number) => void;
  removeItem: (id: string) => void;
  setShippingFee: (fee: number) => void;
  setDeliveryMethod: (m: "Courier" | "Pickup Station") => void;
  setSelectedPickupStationId: (id: string) => void;
  setGlobalDiscount: (discount: number) => void;
  setPaymentStatus: (s: PosState["paymentStatus"]) => void;
  setPaymentMethod: (m: PosState["paymentMethod"]) => void;
  setInternalNotes: (notes: string) => void;
  
  clear: () => void;
  
  // Computed (these will just be getters handled in UI, but we provide helpers)
  getSubtotal: () => number;
  getTotal: () => number;
};

export const usePos = create<PosState>((set, get) => ({
  customer: null,
  items: [],
  shippingFee: 0,
  globalDiscount: 0,
  deliveryMethod: "Courier",
  selectedPickupStationId: "",
  paymentStatus: "Pending Payment",
  paymentMethod: "",
  internalNotes: "",

  setCustomer: (c) => set({ customer: c }),
  
  addItem: (p, qty = 1, variant, variantId) => set((s) => {
    // If exact product+variant exists, just increment qty
    const existingIdx = s.items.findIndex(
      i => i.product.id === p.id && (variantId ? i.variantId === variantId : i.variant === variant)
    );
    if (existingIdx >= 0) {
      const newItems = [...s.items];
      newItems[existingIdx].qty += qty;
      return { items: newItems };
    }
    // Otherwise add new line item
    return {
      items: [
        ...s.items,
        { id: crypto.randomUUID(), product: p, qty, variant, variantId, customDiscount: 0 }
      ]
    };
  }),

  updateItemQty: (id, qty) => set((s) => ({
    items: s.items.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i)
  })),

  updateItemDiscount: (id, discount) => set((s) => ({
    items: s.items.map(i => i.id === id ? { ...i, customDiscount: discount } : i)
  })),

  removeItem: (id) => set((s) => ({
    items: s.items.filter(i => i.id !== id)
  })),

  setShippingFee: (f) => set({ shippingFee: f }),
  setDeliveryMethod: (m) => set({ deliveryMethod: m }),
  setSelectedPickupStationId: (id) => set({ selectedPickupStationId: id }),
  setGlobalDiscount: (d) => set({ globalDiscount: d }),
  setPaymentStatus: (status) => set({ paymentStatus: status }),
  setPaymentMethod: (m) => set({ paymentMethod: m }),
  setInternalNotes: (n) => set({ internalNotes: n }),

  clear: () => set({
    customer: null,
    items: [],
    shippingFee: 0,
    globalDiscount: 0,
    deliveryMethod: "Courier",
    selectedPickupStationId: "",
    paymentStatus: "Pending Payment",
    paymentMethod: "",
    internalNotes: ""
  }),

  getSubtotal: () => {
    return get().items.reduce((total, item) => {
      const itemTotal = (item.product.price * item.qty) - item.customDiscount;
      return total + Math.max(0, itemTotal);
    }, 0);
  },

  getTotal: () => {
    const sub = get().getSubtotal();
    return Math.max(0, sub - get().globalDiscount) + get().shippingFee;
  }
}));
