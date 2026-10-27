import { create } from "zustand";

type State = {
  open: boolean;
  openDrawer: () => void;
  close: () => void;
  toggle: () => void;
};

export const useCartDrawer = create<State>((set) => ({
  open: false,
  openDrawer: () => set({ open: true }),
  close: () => set({ open: false }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
