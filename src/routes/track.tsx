import { createFileRoute, useSearch, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Check,
  Truck,
  MapPin,
  Package,
  Search,
  AlertCircle,
  HeadphonesIcon,
  ChevronDown,
  Loader2,
  Copy,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { formatNaira, type OrderStatus, type Order } from "@/lib/mock-data";
import { useOrderDetailQuery } from "@/hooks/queries/useOrdersQuery";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

type TrackSearch = { id?: string; order?: string; trackingId?: string };

export const Route = createFileRoute("/track")({
  component: TrackPage,
  validateSearch: (s: Record<string, unknown>): TrackSearch => {
    const raw = s.id ?? s.order ?? s.trackingId ?? s.tracking_id;
    return {
      id: typeof raw === "string" && raw.trim() ? raw.trim() : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Track Your Order — EIMAH" },
      { name: "description", content: "Enter your tracking ID to see live updates on your order." },
    ],
  }),
});

function fmtTimestamp(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Status Steps for Courier vs Pickup ────────────────────────────────────────

type StepItem = {
  key: OrderStatus;
  label: string;
};

const COURIER_STEPS: StepItem[] = [
  { key: "Paid", label: "Payment Confirmed" },
  { key: "Processing", label: "Processing" },
  { key: "Shipped", label: "Out for Delivery" },
  { key: "Delivered", label: "Delivered" },
];

const PICKUP_STEPS: StepItem[] = [
  { key: "Paid", label: "Payment Confirmed" },
  { key: "Processing", label: "Processing" },
  { key: "Ready for Pick-up", label: "Ready for Pickup" },
  { key: "Collected", label: "Collected" },
];

const STATUS_PILL: Record<string, string> = {
  Paid: "bg-[#E0F2FE] text-[#0284C7]",
  Processing: "bg-[#FFF8E1] text-[#D97706]",
  Shipped: "bg-[#EEF2FF] text-[#4F46E5]",
  Delivered: "bg-[#E5FFEE] text-[#16A34A]",
  "Ready for Pick-up": "bg-[#F3E8FF] text-[#9333EA]",
  Collected: "bg-[#E5FFEE] text-[#16A34A]",
  Cancelled: "bg-[#FEE2E2] text-[#DC2626]",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

function TrackPage() {
  const search = useSearch({ from: "/track" });
  const navigate = useNavigate({ from: "/track" });

  const [inputVal, setInputVal] = useState(search.id ?? "");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const trackingIdParam = search.id ? search.id.trim() : "";

  // Trigger smooth loading state on search change
  useEffect(() => {
    if (trackingIdParam) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 550);
      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(false);
      setInputVal("");
    }
  }, [trackingIdParam]);

  const { data: dbOrder, isLoading: isQueryLoading } = useOrderDetailQuery(
    trackingIdParam || undefined,
  );

  const order = dbOrder;
  const isLoading = isTransitioning || isQueryLoading;

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const clean = inputVal.trim();
    if (clean) {
      navigate({
        to: "/track",
        search: { id: clean },
      });
    }
  }

  function handleBackToSearch() {
    setInputVal("");
    navigate({
      to: "/track",
      search: {},
    });
  }

  return (
    <SiteLayout>
      {/* ── 1. LOADING VIEW ──────────────────────────────────────────────── */}
      {trackingIdParam && isLoading && (
        <div className="container-eimah py-28 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-brand-pink/15 grid place-items-center mb-4">
              <Loader2 className="size-8 animate-spin text-brand-pink" strokeWidth={2.5} />
            </div>
            <div className="absolute inset-0 bg-brand-pink/20 blur-xl rounded-full -z-10 animate-pulse" />
          </div>
          <h2 className="font-display font-bold text-lg text-foreground mt-2">
            Locating Order Status...
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Tracking ID: <span className="font-semibold text-foreground">{trackingIdParam}</span>
          </p>
        </div>
      )}

      {/* ── 2. SEARCH / INITIAL VIEW (When no search parameter) ─────────── */}
      {!trackingIdParam && (
        <div className="animate-in fade-in duration-300">
          {/* Hero & Search Form */}
          <div className="bg-white pt-14 pb-10 border-b border-border/50">
            <div className="container-eimah">
              <div className="max-w-xl mx-auto text-center">
                <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight text-ink">
                  Track Your Order
                </h1>
                <p className="mt-2.5 text-muted-foreground text-sm sm:text-base">
                  Enter your tracking ID below to get real-time status updates.
                </p>

                {/* Search Box */}
                <form
                  onSubmit={handleTrack}
                  className="mt-6 flex items-center gap-0 rounded-2xl border border-border shadow-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-brand-pink/40 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 pl-4 sm:pl-5 pr-2">
                    <Search className="size-4 text-muted-foreground shrink-0" strokeWidth={2} />
                    <input
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="e.g. EMH-CR-7K4X9P2M"
                      className="flex-1 h-13 bg-transparent focus:outline-none text-sm sm:text-base font-semibold uppercase placeholder:normal-case placeholder:font-normal placeholder:text-muted-foreground/60"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-13 px-6 sm:px-7 bg-brand-pink text-ink font-display font-bold text-xs sm:text-sm tracking-wide hover:bg-brand-pink/90 transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <span>Track</span>
                    <ArrowRight className="size-4" strokeWidth={2.5} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* 3 Pre-search Cards */}
          <div className="container-eimah pb-24 pt-10">
            <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4">
              {[
                {
                  n: "1",
                  title: "Find your ID",
                  body: "Check your order confirmation email for your EMH tracking ID.",
                },
                {
                  n: "2",
                  title: "Enter it above",
                  body: "Paste your tracking ID into the search bar and click Track.",
                },
                {
                  n: "3",
                  title: "See live status",
                  body: "View real-time updates from payment confirmation to final delivery or pickup.",
                },
              ].map((card) => (
                <div
                  key={card.n}
                  className="rounded-2xl border border-border bg-white p-5 shadow-xs"
                >
                  <div className="h-8 w-8 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center mb-3 font-display">
                    {card.n}
                  </div>
                  <h3 className="font-semibold text-sm mb-1 text-foreground">{card.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. TRACKING DETAILS VIEW (When searched and done loading) ─────── */}
      {trackingIdParam && !isLoading && (
        <div className="container-eimah pt-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="max-w-4xl mx-auto">
            {/* Top Bar: Back Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleBackToSearch}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-white hover:bg-surface text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="size-3.5" />
                <span>Track Another Order</span>
              </button>
            </div>

            {order ? (
              <OrderResult order={order as any} />
            ) : (
              <NotFound query={trackingIdParam} onBack={handleBackToSearch} />
            )}
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

// ─── Not Found Component ─────────────────────────────────────────────────────

function NotFound({ query, onBack }: { query: string; onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border border-border shadow-sm p-8 text-center mt-4">
      <div className="inline-flex h-12 w-12 rounded-full bg-rose-50 text-rose-500 items-center justify-center mb-3">
        <AlertCircle className="size-6" strokeWidth={1.75} />
      </div>
      <h2 className="font-display font-bold text-lg mb-1.5 text-foreground">Order Not Found</h2>
      <p className="text-muted-foreground text-xs leading-relaxed mb-5">
        No order found with Tracking ID{" "}
        <span className="font-mono font-semibold text-foreground">"{query}"</span>. Please
        double-check and try again.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="px-4 py-2 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-ink/90 transition-colors cursor-pointer"
      >
        Try Another ID
      </button>
    </div>
  );
}

// ─── Items Accordion ──────────────────────────────────────────────────────────

type OrderItem = Order["items"][0];

function ItemsAccordion({ items }: { items: OrderItem[] }) {
  const [open, setOpen] = useState(true);
  const totalQty = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
  const totalWeight =
    Math.round(
      items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.weight) || 0), 0) * 100,
    ) / 100;

  return (
    <div className="border-b border-border/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-surface/50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-foreground">
            {totalQty} item{totalQty !== 1 ? "s" : ""} ordered
            {totalWeight > 0 ? ` · ${totalWeight} kg` : ""}
          </span>
          <span className="text-[11px] text-muted-foreground">
            ({items.length} product{items.length !== 1 ? "s" : ""})
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <ul className="divide-y divide-border/40 border-t border-border/40">
          {items.map((it, i) => (
            <li key={i} className="px-5 py-3 flex items-center justify-between gap-3 bg-surface/20">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-snug">{it.name}</p>
                {it.variant && (
                  <span className="text-[10px] text-muted-foreground bg-surface border border-border/50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                    {it.variant}
                  </span>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {it.qty} × {formatNaira(it.price)}
                  {it.weight ? (
                    <span className="text-muted-foreground ml-1">({it.weight} kg each)</span>
                  ) : null}
                </p>
              </div>
              <span className="text-xs font-bold text-foreground shrink-0 tabular-nums">
                {formatNaira(it.subtotal || it.qty * it.price)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Order Result ─────────────────────────────────────────────────────────────

function OrderResult({ order }: { order: Order }) {
  const isPickup = order.deliveryMethod === "Pickup Station";
  const steps = isPickup ? PICKUP_STEPS : COURIER_STEPS;

  // Determine active step index
  let activeIndex = steps.findIndex((s) => s.key === order.status);
  if (activeIndex === -1) {
    if (order.status === "Delivered" || order.status === "Collected") {
      activeIndex = steps.length - 1;
    } else {
      activeIndex = 0;
    }
  }

  const deliveredHist = order.trackingHistory?.find(
    (h) => h.status === "Delivered" || h.status === "Collected",
  );

  function copyTrackingId() {
    navigator.clipboard.writeText(order.trackingId);
    toast.success("Tracking ID copied!");
  }

  return (
    <div className="space-y-4">
      {/* ── 1. Clean Top Header Card ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-xs p-5 space-y-4">
        {/* Top Row: Tracking ID & Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Tracking ID:
            </span>
            <button
              onClick={copyTrackingId}
              type="button"
              className="inline-flex items-center gap-1.5 font-mono font-bold text-base sm:text-lg text-foreground hover:text-brand-pink transition-colors cursor-pointer group"
              title="Click to copy tracking ID"
            >
              <span>{order.trackingId}</span>
              <Copy className="size-3.5 text-muted-foreground group-hover:text-brand-pink transition-colors" />
            </button>
          </div>

          <span
            className={cn(
              "inline-flex items-center justify-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[4px]",
              STATUS_PILL[order.status] ?? "bg-gray-100 text-gray-700",
            )}
          >
            {order.status}
          </span>
        </div>

        {/* Bottom Info Grid: Order Date, Delivery Type, Estimated Delivery */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 text-xs">
          {/* 1. Order Date */}
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Order Date:
            </p>
            <p className="font-semibold text-foreground text-sm">{fmtDate(order.date)}</p>
          </div>

          {/* 2. Delivery Type */}
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Delivery Type:
            </p>
            <p className="font-semibold text-foreground text-sm">
              {isPickup ? "Pickup Station" : "Courier Delivery"}
            </p>
          </div>

          {/* 3. Estimated Delivery / Arrival */}
          <div className="space-y-0.5 sm:text-right">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              {order.status === "Delivered"
                ? "Delivered On:"
                : order.status === "Collected"
                  ? "Collected On:"
                  : isPickup
                    ? "Est. Station Arrival:"
                    : "Estimated Delivery:"}
            </p>
            <p className="font-display font-bold text-sm text-foreground">
              {deliveredHist ? fmtDate(deliveredHist.date) : "1–3 business days"}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Progress Status Card ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
        <p className="text-xs uppercase tracking-[0.12em] text-foreground font-bold font-display mb-6">
          Order Status
        </p>

        {/* ── DESKTOP: Horizontal Timeline ── */}
        <div className="hidden md:block">
          <div className="relative flex items-center justify-between">
            {/* Background connecting line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-border/60 -z-0" />
            {/* Active connecting line */}
            <div
              className="absolute top-4 left-6 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
              style={{
                width: `${(activeIndex / (steps.length - 1)) * 100}%`,
                maxWidth: "calc(100% - 48px)",
              }}
            />

            {steps.map((step, i) => {
              const done = i <= activeIndex;
              const current = i === activeIndex;
              const histItem = order.trackingHistory?.find((h) => h.status === step.key);

              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center text-center relative z-10 flex-1 px-1"
                >
                  {/* Step Node */}
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full border-2 grid place-items-center transition-all duration-300",
                      done && !current
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : current
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-110"
                          : "bg-white border-border/80 text-transparent",
                    )}
                  >
                    {done ? (
                      <Check className="size-4" strokeWidth={2.5} />
                    ) : (
                      <span className="size-2 rounded-full bg-border" />
                    )}
                  </div>

                  {/* Step Title & Timestamp */}
                  <p
                    className={cn(
                      "text-xs font-semibold mt-3 max-w-[130px]",
                      done ? "text-foreground" : "text-muted-foreground/50",
                    )}
                  >
                    {step.label}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] mt-0.5 tabular-nums",
                      histItem ? "text-muted-foreground" : "text-muted-foreground/30",
                    )}
                  >
                    {histItem ? fmtTimestamp(histItem.date) : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE: Vertical Timeline ── */}
        <div className="block md:hidden">
          <ol className="space-y-1">
            {steps.map((step, i) => {
              const done = i <= activeIndex;
              const current = i === activeIndex;
              const histItem = order.trackingHistory?.find((h) => h.status === step.key);
              const isLast = i === steps.length - 1;

              return (
                <li key={step.key} className="flex gap-3.5">
                  {/* Dot & vertical line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full border-2 grid place-items-center shrink-0 transition-all",
                        done && !current
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : current
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)] scale-105"
                            : "bg-white border-border/80 text-transparent",
                      )}
                    >
                      {done ? (
                        <Check className="size-3.5" strokeWidth={2.5} />
                      ) : (
                        <span className="size-1.5 rounded-full bg-border" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 my-1 flex-1 min-h-[30px]",
                          i < activeIndex ? "bg-emerald-500" : "bg-border/50",
                        )}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className={cn("flex-1", isLast ? "pb-0" : "pb-5")}>
                    <p
                      className={cn(
                        "text-xs font-semibold leading-tight",
                        done ? "text-foreground" : "text-muted-foreground/50",
                      )}
                    >
                      {step.label}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] mt-0.5 tabular-nums",
                        histItem ? "text-muted-foreground" : "text-muted-foreground/30",
                      )}
                    >
                      {histItem ? fmtTimestamp(histItem.date) : "Pending"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* ── 3. Order Details Summary & Help ───────────────────────────────── */}
      <div className="grid md:grid-cols-[1fr_280px] gap-4 items-start">
        {/* Items Summary Card */}
        <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-border/50">
            <p className="text-xs uppercase tracking-[0.12em] text-foreground font-bold font-display">
              Order Items
            </p>
          </div>

          <ItemsAccordion items={order.items} />

          {/* Totals */}
          <div className="px-5 py-4 space-y-2 bg-surface/20">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground font-medium">{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Shipping</span>
              <span className="text-foreground font-medium">
                {order.shippingFee === 0 ? "Free" : formatNaira(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/40 text-sm font-bold text-foreground">
              <span>Total</span>
              <span className="font-display font-black text-lg">{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Support Help Card */}
        <div className="bg-white rounded-2xl border border-border shadow-xs p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-brand-pink/15 text-ink grid place-items-center shrink-0">
              <HeadphonesIcon className="size-4" strokeWidth={1.75} />
            </div>
            <h3 className="font-display font-bold text-sm text-foreground">Need Help?</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Have questions about your package delivery? Our support team is here to help.
          </p>
          <Link
            to="/contact"
            className="w-full h-9 rounded-xl border border-border hover:bg-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Contact Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
