import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import {
  seedExports,
  type AdminProduct,
  type AdminOrder,
  type AdminOrderStatus,
  type AdminCategory,
  type AdminCustomer,
  type Banner,
  type Popup,
  type Solution,
  type SolutionPayment,
  type PaymentStatus,
  type ExportRow,
  type Transaction,
  type ProductStatus,
} from "./admin-data";
import {
  insertCategory,
  updateCategory as updateCategoryDB,
  deleteCategory as deleteCategoryDB,
} from "./db/categories";
import {
  insertBanner,
  updateBanner as updateBannerDB,
  deleteBanner as deleteBannerDB,
  insertPopup,
  updatePopup as updatePopupDB,
  deletePopup as deletePopupDB,
  updateSolutionDB,
  updateSolutionPaymentStatus as updateSolutionPaymentStatusDB,
  insertPickupStation,
  updatePickupStation as updatePickupStationDB,
  deletePickupStation as deletePickupStationDB,
} from "./db/content";
import { type AdminDelivery, type DeliveryStatus } from "./db/deliveries";

export type PickupStation = {
  id: string;
  name: string;
  address: string;
  fee?: number;
};

// ─────────────────────────────────────────────────────────────
// Auth Store
// ─────────────────────────────────────────────────────────────
type AuthState = {
  isAuthed: boolean;
  admin: { name: string; email: string; role: string; avatarBg: string } | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
};

export const useAdminAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthed: false,
      admin: null,
      login: (email, name) => {
        if (typeof document !== "undefined") {
          document.cookie = "eimah_admin_authed=1; path=/; max-age=2592000; SameSite=Lax";
        }
        set({
          isAuthed: true,
          admin: {
            name:
              name ||
              email
                .split("@")[0]
                .replace(/\./g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            email,
            role: "Administrator",
            avatarBg: "#F590DD",
          },
        });
      },
      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie = "eimah_admin_authed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        }
        set({ isAuthed: false, admin: null });
      },
    }),
    { name: "eimah-admin-auth" },
  ),
);

export function isClientAuthed(): boolean {
  if (typeof window === "undefined") return false;
  if (useAdminAuth.getState().isAuthed) return true;
  try {
    if (document.cookie.includes("eimah_admin_authed=1")) return true;
    const stored = localStorage.getItem("eimah-admin-auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.isAuthed) {
        return true;
      }
    }
  } catch {}
  return false;
}

// ─────────────────────────────────────────────────────────────
// Admin Store
// Scope: categories, banners, popups, solutions, solution payments,
//        pickup stations, and exports.
//
// products / orders / customers / deliveries are now fully
// managed by TanStack React Query (see src/hooks/queries/).
// ─────────────────────────────────────────────────────────────
type AdminState = {
  categories: AdminCategory[];
  banners: Banner[];
  popups: Popup[];
  solutions: Solution[];
  solutionPayments: SolutionPayment[];
  exports: ExportRow[];
  pickupStations: PickupStation[];

  // Categories
  addCategory: (c: AdminCategory) => void;
  updateCategory: (slug: string, patch: Partial<AdminCategory>) => void;
  deleteCategory: (slug: string) => void;

  // Banners
  addBanner: (b: Banner) => void;
  updateBanner: (id: string, patch: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;

  // Popups
  addPopup: (p: Popup) => void;
  updatePopup: (id: string, patch: Partial<Popup>) => void;
  deletePopup: (id: string) => void;

  // Solutions
  updateSolution: (id: string, patch: Partial<Solution>) => void;
  addSolutionPayment: (sp: SolutionPayment) => void;
  updateSolutionPaymentStatus: (id: string, status: PaymentStatus) => void;

  // Exports
  addExport: (e: ExportRow) => void;

  // Pickup Stations
  addPickupStation: (p: PickupStation) => void;
  updatePickupStation: (id: string, patch: Partial<PickupStation>) => void;
  deletePickupStation: (id: string) => void;
};

export const useAdminStore = create<AdminState>()((set) => ({
  categories: [],
  banners: [],
  popups: [],
  solutions: [],
  solutionPayments: [],
  exports: seedExports,
  pickupStations: [],

  // ── Categories ───────────────────────────────────────────
  addCategory: (c) => {
    set((s) => ({ categories: [c, ...s.categories] }));
    insertCategory(c).catch(console.error);
  },
  updateCategory: (slug, patch) => {
    set((s) => ({
      categories: s.categories.map((c) => (c.slug === slug ? { ...c, ...patch } : c)),
    }));
    updateCategoryDB(slug, patch).catch(console.error);
  },
  deleteCategory: (slug) => {
    set((s) => ({ categories: s.categories.filter((c) => c.slug !== slug) }));
    deleteCategoryDB(slug).catch(console.error);
  },

  // ── Banners ──────────────────────────────────────────────
  addBanner: (b) => {
    set((s) => ({
      banners: [
        b,
        ...s.banners.map((existing) =>
          b.status === "Active" && existing.status === "Active"
            ? { ...existing, status: "Draft" as const }
            : existing,
        ),
      ],
    }));
    insertBanner(b).catch(console.error);
  },
  updateBanner: (id, patch) => {
    set((s) => ({
      banners: s.banners.map((b) => {
        if (b.id === id) return { ...b, ...patch };
        if (patch.status === "Active" && b.status === "Active") {
          return { ...b, status: "Draft" as const };
        }
        return b;
      }),
    }));
    updateBannerDB(id, patch).catch(console.error);
  },
  deleteBanner: (id) => {
    set((s) => ({ banners: s.banners.filter((b) => b.id !== id) }));
    deleteBannerDB(id).catch(console.error);
  },

  // ── Popups ───────────────────────────────────────────────
  addPopup: (p) => {
    set((s) => ({ popups: [p, ...s.popups] }));
    insertPopup(p).catch(console.error);
  },
  updatePopup: (id, patch) => {
    set((s) => ({ popups: s.popups.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
    updatePopupDB(id, patch).catch(console.error);
  },
  deletePopup: (id) => {
    set((s) => ({ popups: s.popups.filter((p) => p.id !== id) }));
    deletePopupDB(id).catch(console.error);
  },

  // ── Solutions ────────────────────────────────────────────
  updateSolution: (id, patch) => {
    set((s) => ({
      solutions: s.solutions.map((so) => (so.id === id ? { ...so, ...patch } : so)),
    }));
    updateSolutionDB(id, patch).catch(console.error);
  },
  addSolutionPayment: (sp) => set((s) => ({ solutionPayments: [sp, ...s.solutionPayments] })),
  updateSolutionPaymentStatus: (id, status) => {
    set((s) => ({
      solutionPayments: s.solutionPayments.map((sp) => (sp.id === id ? { ...sp, status } : sp)),
    }));
    updateSolutionPaymentStatusDB(id, status).catch(console.error);
  },

  // ── Exports ──────────────────────────────────────────────
  addExport: (e) => set((s) => ({ exports: [e, ...s.exports] })),

  // ── Pickup Stations ──────────────────────────────────────
  addPickupStation: (p) => {
    set((s) => ({ pickupStations: [p, ...s.pickupStations] }));
    insertPickupStation(p).catch(console.error);
  },
  updatePickupStation: (id, patch) => {
    set((s) => ({
      pickupStations: s.pickupStations.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    updatePickupStationDB(id, patch).catch(console.error);
  },
  deletePickupStation: (id) => {
    set((s) => ({ pickupStations: s.pickupStations.filter((p) => p.id !== id) }));
    deletePickupStationDB(id).catch(console.error);
  },
}));

export type {
  AdminProduct,
  AdminOrder,
  AdminOrderStatus,
  ProductStatus,
  AdminCategory,
  AdminCustomer,
  Banner,
  Popup,
  Solution,
  SolutionPayment,
  PaymentStatus,
  ExportRow,
  Transaction,
};
