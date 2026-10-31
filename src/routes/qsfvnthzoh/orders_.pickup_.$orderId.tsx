import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, Store, MapPin, Phone, ChevronDown, Copy, Check } from "lucide-react";
import { toast } from "react-toastify";
import { StatusPill } from "@/components/admin/parts";
import { type AdminOrderStatus } from "@/lib/admin-store";
import {
  useOrderDetailQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderNotesMutation,
} from "@/hooks/queries/useOrdersQuery";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/qsfvnthzoh/orders_/pickup_/$orderId")({
  component: PickupOrderDetailsPage,
});

const STATUSES: AdminOrderStatus[] = ["Paid", "Processing", "Ready for Pick-up", "Collected"];

function PickupOrderDetailsPage() {
  const { orderId } = Route.useParams();
  const { data: order, isLoading } = useOrderDetailQuery(orderId);
  const statusMutation = useUpdateOrderStatusMutation();
  const notesMutation = useUpdateOrderNotesMutation();

  const [notes, setNotes] = useState("");
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AdminOrderStatus | null>(null);

  useEffect(() => {
    if (order) setNotes(order.internalNotes || "");
  }, [order]);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-foreground">Order Not Found</h2>
        <p className="text-muted-foreground text-xs">
          No pick-up order was found with ID <span className="font-mono">{orderId}</span>.
        </p>
        <Link
          to="/qsfvnthzoh/orders/pickup"
          className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Return to Pick-up Orders
        </Link>
      </div>
    );
  }

  const handleSaveNotes = async () => {
    if (notesMutation.isPending) return;
    try {
      await notesMutation.mutateAsync({ id: order.id, notes });
      toast.success("Internal notes saved successfully.");
    } catch {
      toast.error("Failed to save notes.");
    }
  };

  const handleCopyTracking = () => {
    if (!order.trackingId) return;
    navigator.clipboard.writeText(order.trackingId);
    setCopiedTracking(true);
    toast.success("Tracking ID copied to clipboard");
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleStatusChange = async (newStatus: AdminOrderStatus) => {
    if (newStatus === order.status || statusMutation.isPending) return;
    setPendingStatus(newStatus);
    try {
      await statusMutation.mutateAsync({ id: order.id, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setPendingStatus(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalItems = order.items.reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
  const totalWeight =
    Math.round(
      order.items.reduce(
        (acc, item) => acc + (Number(item.qty) || 0) * (Number(item.weight) || 0),
        0,
      ) * 100,
    ) / 100;
  const initials = order.customer
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="space-y-6 pb-12 text-foreground pt-2 sm:pt-1">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
        <Link
          to="/qsfvnthzoh/orders/pickup"
          className="inline-flex items-center gap-2 h-9 px-4.5 rounded-full border border-border bg-white text-xs font-semibold text-foreground hover:bg-ink hover:text-white hover:border-ink transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="size-3.5" /> Back to Pick-up Orders
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 h-9 px-4.5 rounded-full border border-border bg-white text-xs font-semibold text-foreground hover:bg-ink hover:text-white hover:border-ink transition-all shadow-2xs cursor-pointer"
        >
          <Printer className="size-3.5" /> Print Invoice
        </button>
      </div>

      {/* Main Order Header Card */}
      <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xs border border-border space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="size-14 sm:size-16 rounded-full bg-brand-pink text-ink font-bold text-base sm:text-lg grid place-items-center shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                  Pick-up Order {order.id}
                </h1>
                <StatusPill value={order.status} />
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                <span className="text-muted-foreground">Tracking ID:</span>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="font-mono font-bold bg-secondary/80 hover:bg-secondary text-foreground px-2 py-0.5 rounded border border-border flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Click to copy tracking ID"
                >
                  <span>{order.trackingId || order.id}</span>
                  {copiedTracking ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-normal break-words">
                Customer: <span className="font-medium text-foreground">{order.customer}</span> (
                {order.email})
              </p>
              <p className="text-xs text-muted-foreground font-normal">
                Placed on{" "}
                {new Date(order.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Desktop Quick Status Pill Bar */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-secondary/50 rounded-full border border-border">
            {STATUSES.map((s) => {
              const isActive = order.status === s;
              const isThisPending = statusMutation.isPending && pendingStatus === s;
              return (
                <button
                  key={s}
                  disabled={statusMutation.isPending}
                  onClick={() => handleStatusChange(s)}
                  className={cn(
                    "text-center px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1.5 min-w-[80px]",
                    isActive
                      ? "bg-black text-white shadow-2xs"
                      : isThisPending
                        ? "bg-brand-pink/20 text-ink font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/80",
                    statusMutation.isPending && !isThisPending && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {isThisPending && <Loader size="xs" />}
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile: Clean Status Select Dropdown Below */}
        <div className="md:hidden pt-3 border-t border-border/60 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Update Status:
          </span>
          <div className="relative flex-1 max-w-[220px]">
            <select
              value={order.status}
              disabled={statusMutation.isPending}
              onChange={(e) => handleStatusChange(e.target.value as AdminOrderStatus)}
              className="w-full h-9 rounded-xl border border-border bg-surface px-3 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:border-foreground appearance-none cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            {statusMutation.isPending && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <Loader size="xs" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Items & Price Breakdown */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items Card */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xs border border-border space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-display font-semibold text-base text-foreground">
                Items Ordered
              </h3>
              <span className="text-xs font-medium text-muted-foreground bg-secondary/60 px-3 py-0.5 rounded-full border border-border">
                {totalItems} {totalItems === 1 ? "item" : "items"} · {totalWeight} kg
              </span>
            </div>

            <div className="divide-y divide-border/40">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-11 rounded-2xl bg-secondary/50 text-muted-foreground font-semibold text-xs grid place-items-center shrink-0 border border-border/40">
                      {item.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground font-normal">{item.variant}</p>
                      )}
                      <p className="text-xs text-muted-foreground font-normal mt-0.5">
                        Qty: <span className="font-medium text-foreground">{item.qty}</span> ×{" "}
                        {formatNaira(item.price)}
                        {item.weight ? (
                          <span className="text-muted-foreground ml-1 font-mono">
                            ({item.weight} kg each)
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-sm text-foreground">
                      {formatNaira(item.subtotal || item.price * item.qty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal / Pickup Fee / Total Price Summary */}
            <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Pick-up Station Handling Fee</span>
                <span className="font-medium text-emerald-600">
                  {order.shippingFee === 0 ? "Free" : formatNaira(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border/40">
                <span>Total Amount Paid</span>
                <span className="font-display font-bold text-base text-foreground">
                  {formatNaira(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Internal Notes Card */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xs border border-border space-y-3">
            <h3 className="font-display font-semibold text-base text-foreground">Internal Notes</h3>
            <p className="text-xs text-muted-foreground font-normal">
              Staff notes regarding customer verification, package identification, or collection
              timeline.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter internal pick-up notes..."
              rows={3}
              className="w-full rounded-2xl border border-border bg-white p-3.5 text-xs focus:outline-none focus:border-foreground/60 transition-all"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={notesMutation.isPending}
                className="h-8.5 px-4 rounded-full bg-black text-white font-medium text-xs hover:bg-neutral-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                {notesMutation.isPending ? (
                  <>
                    <Loader size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Notes"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Clean Information Grid */}
        <div className="space-y-5">
          {/* Customer & Contact Info Card */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xs border border-border space-y-5">
            <h3 className="font-display font-semibold text-base text-foreground border-b border-border/50 pb-3">
              Customer Info
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground text-[11px] block font-normal mb-0.5">
                  Full Name
                </span>
                <span className="font-medium text-foreground text-sm">{order.customer}</span>
              </div>

              <div>
                <span className="text-muted-foreground text-[11px] block font-normal mb-0.5">
                  Email Address
                </span>
                <a
                  href={`mailto:${order.email}`}
                  className="font-medium text-foreground hover:underline truncate block"
                >
                  {order.email}
                </a>
              </div>

              <div>
                <span className="text-muted-foreground text-[11px] block font-normal mb-0.5">
                  Pickup Contact Phone
                </span>
                <a
                  href={`tel:${order.phone}`}
                  className="font-medium text-foreground hover:underline block"
                >
                  {order.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Pick-up Station & Payment Card */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xs border border-border space-y-5">
            <h3 className="font-display font-semibold text-base text-foreground border-b border-border/50 pb-3">
              Pick-up Station Details
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground text-[11px] block font-normal mb-0.5">
                  Delivery Type
                </span>
                <p className="font-semibold text-foreground text-sm">Pickup Station</p>
              </div>

              <div>
                <span className="text-muted-foreground text-[11px] block font-normal mb-0.5">
                  Total Package Weight
                </span>
                <p className="font-semibold text-foreground text-sm">{totalWeight} kg</p>
              </div>

              <div>
                <span className="text-muted-foreground text-[11px] block font-normal mb-1">
                  Payment Status
                </span>
                <StatusPill value={order.paymentStatus || "Successful"} />
              </div>

              <div className="pt-2 border-t border-border/50">
                <span className="text-muted-foreground text-[11px] block font-normal mb-1">
                  Assigned Station Hub Address
                </span>
                <p className="font-medium text-foreground leading-relaxed text-xs">
                  {order.address || "Main Pickup Station Hub"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
