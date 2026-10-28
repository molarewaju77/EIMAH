import {
  products as baseProducts,
  categories as baseCats,
  orders as baseOrders,
  customers as baseCustomers,
  type Product,
  type Category,
  type Order,
  type OrderStatus,
} from "./mock-data";

// ---------- Enriched product for admin ----------
export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type ProductStatus = "Active" | "Draft" | "Archived";

export type AdminProduct = Product & {
  sku: string;
  costPrice: number;
  status: ProductStatus;
  createdAt: string;
  sold: number;
};

const COLOR_PALETTE = [
  "Charcoal",
  "Cream",
  "Sand",
  "Black",
  "Cognac",
  "Olive",
  "Terracotta",
  "Amber",
  "White",
  "Tan",
  "Kraft",
];

export function stockStatusFor(stock: number): StockStatus {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 8) return "Low Stock";
  return "In Stock";
}

export const adminProducts: AdminProduct[] = baseProducts.map((p, idx) => ({
  ...p,
  sku: `EMH-${p.category.slice(0, 3).toUpperCase()}-${String(1001 + idx).padStart(4, "0")}`,
  costPrice: Math.round(p.price * 0.58),
  status: (idx % 11 === 0 ? "Draft" : "Active") as ProductStatus,
  createdAt: new Date(2026, 5 + (idx % 3), 3 + (idx % 20)).toISOString(),
  sold: 120 - idx * 4 + (idx % 5) * 6,
}));

// ---------- Categories with visibility ----------
export type AdminCategory = Category & {
  active: boolean;
  productCount: number;
};

export const adminCategories: AdminCategory[] = baseCats.map((c) => ({
  ...c,
  active: true,
  productCount: baseProducts.filter((p) => p.category === c.slug).length,
}));

// ---------- Orders (extend) ----------
export type AdminOrderStatus = OrderStatus;
export type AdminOrder = Order & {
  phone: string;
};

export const adminOrders: AdminOrder[] = baseOrders.map((o) => {
  return {
    ...o,
    phone: `+234 80${(Math.abs(o.id.length * 37) % 100).toString().padStart(2, "0")} ${(Math.abs(o.id.length * 91) % 900) + 100} ${(Math.abs(o.id.length * 53) % 9000) + 1000}`,
  };
});

// ---------- Customers ----------
export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  address?: string;
  city?: string;
  state?: string;
  status: "Active" | "New" | "Inactive";
  lastOrder: string;
  dateJoined: string;
  notes?: string;
};

export const adminCustomers: AdminCustomer[] = baseCustomers.map((c, i) => ({
  id: `CUS-${1001 + i}`,
  name: c.name,
  email: c.email,
  phone: `+234 80${(i * 13) % 100} ${100 + ((i * 7) % 900)} ${1000 + ((i * 41) % 9000)}`,
  orders: c.orders,
  spent: c.spent,
  address: `${14 + i * 3} Admiralty Way, Phase ${1 + (i % 2)}`,
  city: c.city,
  state:
    c.city === "Abuja"
      ? "FCT"
      : c.city === "Port Harcourt"
        ? "Rivers"
        : c.city === "Ibadan"
          ? "Oyo"
          : "Lagos",
  status: c.orders > 5 ? "Active" : c.orders < 2 ? "Inactive" : "New",
  lastOrder: new Date(2026, 6, 12 + i).toISOString().slice(0, 10),
  dateJoined: new Date(2025, (i * 2) % 12, 5 + ((i * 3) % 20)).toISOString().slice(0, 10),
  notes:
    i % 2 === 0
      ? "Prefers courier delivery. VIP customer."
      : "Regular customer. Prefers pickup station.",
}));

// ---------- Promotional Banners ----------
export type BannerStatus = "Active" | "Scheduled" | "Draft" | "Disabled";

export type CtaTarget =
  | "home"
  | "shop"
  | "clothing"
  | "shoes"
  | "bags"
  | "gifts"
  | "solutions"
  | "solutions-business"
  | "sourcing"
  | "procurement"
  | "importation"
  | "academy"
  | "academy-procurement"
  | "academy-importation"
  | "about"
  | "track"
  | "contact"
  | "custom"
  | `category:${string}`
  | (string & {});

export type BannerCtaTarget = CtaTarget;

export type Banner = {
  id: string;
  eyebrow?: string;
  title: string;
  supportingText: string;
  ctaText: string;
  ctaTarget?: BannerCtaTarget;
  ctaUrl?: string;
  image: string;
  status: BannerStatus;
  startDate: string;
  endDate: string;
};

export const seedBanners: Banner[] = [
  {
    id: "BNR-01",
    eyebrow: "SEASONAL DROP",
    title: "The Essentials Edit — up to 30% off.",
    supportingText:
      "A tightly edited selection of everyday pieces, priced for real life. While stocks last.",
    ctaText: "Shop the edit",
    ctaTarget: "shop",
    ctaUrl: "/shop",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
    status: "Active",
    startDate: "2026-07-15",
    endDate: "2026-08-30",
  },
  {
    id: "BNR-02",
    eyebrow: "FREE SHIPPING",
    title: "Free delivery on orders above ₦200,000",
    supportingText: "Nationwide delivery across Nigeria. No discount code needed at checkout.",
    ctaText: "Shop now",
    ctaTarget: "shop",
    ctaUrl: "/shop",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1400&q=80",
    status: "Scheduled",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
  },
  {
    id: "BNR-03",
    eyebrow: "NEW COLLECTION",
    title: "New in — Autumn/Winter 26",
    supportingText: "Tailored wool, soft knits and premium outerwear crafted for comfort.",
    ctaText: "Explore drop",
    ctaTarget: "clothing",
    ctaUrl: "/shop/clothing",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=80",
    status: "Draft",
    startDate: "2026-09-01",
    endDate: "2026-10-15",
  },
];

// ---------- Popups ----------
export type PopupCtaTarget = CtaTarget;

export function getCtaTargetUrl(target?: CtaTarget, customUrl?: string, fallback = "/shop"): string {
  if (customUrl && target === "custom") return customUrl;

  if (target?.startsWith("category:")) {
    const slug = target.slice("category:".length);
    return customUrl || `/shop?category=${encodeURIComponent(slug)}`;
  }

  // Normalize legacy category paths if stored in customUrl
  if (customUrl) {
    if (customUrl === "/shop/clothing") return "/shop?category=clothing";
    if (customUrl === "/shop/shoes") return "/shop?category=shoes";
    if (customUrl === "/shop/bags") return "/shop?category=bags";
    if (customUrl === "/shop/gifts-sets") return "/shop?category=gifts-sets";
  }

  switch (target) {
    case "home":
      return "/";
    case "shop":
      return "/shop";
    case "clothing":
      return "/shop?category=clothing";
    case "shoes":
      return "/shop?category=shoes";
    case "bags":
      return "/shop?category=bags";
    case "gifts":
      return "/shop?category=gifts-sets";
    case "solutions":
      return "/solutions";
    case "solutions-business":
      return "/solutions/business";
    case "sourcing":
      return "/solutions/business/sourcing";
    case "procurement":
      return "/solutions/business/procurement";
    case "importation":
      return "/solutions/business/importation";
    case "academy":
      return "/solutions/academy";
    case "academy-procurement":
      return "/solutions/academy/procurement";
    case "academy-importation":
      return "/solutions/academy/importation";
    case "about":
      return "/about";
    case "track":
      return "/track";
    case "contact":
      return "/contact";
    case "custom":
      return customUrl || fallback;
    default:
      return customUrl || fallback;
  }
}

export function getPopupTargetUrl(target?: PopupCtaTarget, customUrl?: string): string {
  return getCtaTargetUrl(target, customUrl, "/solutions");
}

export function getBannerTargetUrl(target?: BannerCtaTarget, customUrl?: string): string {
  return getCtaTargetUrl(target, customUrl, "/shop");
}

export type Popup = {
  id: string;
  title: string;
  body: string;
  ctaText: string;
  ctaTarget?: PopupCtaTarget;
  ctaUrl?: string;
  status: BannerStatus;
};

export const seedPopups: Popup[] = [
  {
    id: "POP-01",
    title: "10% off your first order",
    body: "Join the EIMAH list. We'll drop a code in your inbox.",
    ctaText: "Get code",
    ctaTarget: "shop",
    ctaUrl: "/shop",
    status: "Active",
  },
  {
    id: "POP-02",
    title: "Business procurement enquiry",
    body: "Sourcing something specific? Talk to our procurement team.",
    ctaText: "Contact us",
    ctaTarget: "solutions",
    ctaUrl: "/solutions",
    status: "Disabled",
  },
];

// ---------- Transactions / Payments ----------
export type PaymentStatus = "Successful" | "Pending" | "Failed" | "Refunded";
export type Transaction = {
  id: string;
  customer: string;
  orderId: string;
  type?: "Order" | "Solution";
  amount: number;
  method: "Card" | "Bank Transfer" | "USSD" | string;
  status: PaymentStatus;
  date: string;
};

export const transactions: Transaction[] = adminOrders.flatMap((o, i) => [
  {
    id: `TXN-${5001 + i * 3}`,
    customer: o.customer,
    orderId: o.id,
    amount: o.total,
    method: (["Card", "Bank Transfer", "USSD"] as const)[i % 3],
    status: (
      [
        "Successful",
        "Successful",
        "Pending",
        "Successful",
        "Failed",
        "Successful",
        "Refunded",
      ] as const
    )[i % 7],
    date: o.date,
  },
]);

// ---------- Solutions ----------
export type Solution = {
  id: string;
  category: "Business" | "Learning";
  title: string;
  description: string;
  image?: string;
  price: number;
  discountPercent?: number;
  discountPrice?: number;
  visible?: boolean;
};

export const seedSolutions: Solution[] = [
  {
    id: "S-01",
    category: "Business",
    title: "Supplier Verification",
    description: "Vet manufacturers and vendors before you commit.",
    price: 35000,
    discountPercent: 10,
    discountPrice: 31500,
    visible: true,
  },
  {
    id: "S-02",
    category: "Business",
    title: "Procurement",
    description: "End-to-end purchasing managed by our team.",
    price: 45000,
    discountPercent: 5,
    discountPrice: 42750,
    visible: true,
  },
  {
    id: "S-03",
    category: "Business",
    title: "Product Sourcing",
    description: "Find the right product at the right price, globally.",
    price: 20000,
    discountPercent: 15,
    discountPrice: 17000,
    visible: true,
  },
  {
    id: "S-04",
    category: "Business",
    title: "Importation",
    description: "Freight, clearance and last-mile — handled.",
    price: 65000,
    discountPercent: 10,
    discountPrice: 58500,
    visible: true,
  },
  {
    id: "S-05",
    category: "Learning",
    title: "Importation Training",
    description: "Learn to import profitably from sourcing to clearance.",
    price: 40000,
    discountPercent: 5,
    discountPrice: 38000,
    visible: true,
  },
  {
    id: "S-06",
    category: "Learning",
    title: "Procurement Training",
    description: "Build a procurement function that saves you money.",
    price: 50000,
    discountPercent: 10,
    discountPrice: 45000,
    visible: true,
  },
];

export type SolutionPayment = {
  id: string;
  txnId: string;
  solutionId: string;
  solutionTitle: string;
  category: "Business" | "Learning";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  amount: number;
  method: "Card" | "Bank Transfer" | "USSD";
  status: PaymentStatus;
  date: string;
  details: {
    productTypes?: string;
    sourcingNeeds?: string;
    orderSize?: string;
    hasSupplier?: string;
    timeline?: string;
    businessName?: string;
    experienceLevel?: string;
    learningGoals?: string;
    additionalNotes?: string;
  };
};

export const seedSolutionPayments: SolutionPayment[] = [];

// ---------- Analytics series ----------
export const salesSeries = [
  { m: "Jan", revenue: 2.4, orders: 42 },
  { m: "Feb", revenue: 3.1, orders: 51 },
  { m: "Mar", revenue: 2.9, orders: 47 },
  { m: "Apr", revenue: 4.2, orders: 68 },
  { m: "May", revenue: 3.8, orders: 61 },
  { m: "Jun", revenue: 5.1, orders: 82 },
  { m: "Jul", revenue: 6.4, orders: 96 },
  { m: "Aug", revenue: 5.8, orders: 90 },
  { m: "Sep", revenue: 6.9, orders: 108 },
  { m: "Oct", revenue: 7.5, orders: 121 },
  { m: "Nov", revenue: 8.8, orders: 142 },
  { m: "Dec", revenue: 9.4, orders: 158 },
];

// ---------- Exports history ----------
export type ExportRow = {
  id: string;
  name: string;
  type: string;
  range: string;
  format: "CSV" | "Excel";
  date: string;
  status: "Ready" | "Processing";
  customStart?: string;
  customEnd?: string;
  prod?: string;
  cat?: string;
  recordCount?: number;
};

export const seedExports: ExportRow[] = [
  {
    id: "EXP-1042",
    name: "July 2026 Sales",
    type: "Sales records",
    range: "Jul 01 – Jul 25, 2026",
    format: "CSV",
    date: "2026-07-25",
    status: "Ready",
  },
  {
    id: "EXP-1041",
    name: "Q2 Revenue Report",
    type: "Revenue report",
    range: "Apr 01 – Jun 30, 2026",
    format: "Excel",
    date: "2026-07-05",
    status: "Ready",
  },
  {
    id: "EXP-1040",
    name: "Bags category performance",
    type: "Product sales history",
    range: "Jan 01 – Jun 30, 2026",
    format: "CSV",
    date: "2026-07-02",
    status: "Ready",
  },
  {
    id: "EXP-1039",
    name: "Customer purchases (Lagos)",
    type: "Customer purchases",
    range: "Last 90 days",
    format: "Excel",
    date: "2026-06-28",
    status: "Ready",
  },
];
