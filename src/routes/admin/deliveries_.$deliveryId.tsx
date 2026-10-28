import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  Hash,
  Calendar,
  Clock,
  Package,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { StatusPill } from "@/components/admin/parts";
import { useDeliveryDetailQuery, useUpdateDeliveryMutation } from "@/hooks/queries/useDeliveriesQuery";
import { useOrdersQuery } from "@/hooks/queries/useOrdersQuery";
import { formatNaira } from "@/lib/mock-data";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/admin/deliveries_/$deliveryId")({
  component: DeliveryDetailsPage,
  head: () => ({
    meta: [{ name: "robots", content: "noindex" }],
  }),
});

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DeliveryDetailsPage() {
  const { deliveryId } = Route.useParams();
  const { data: delivery, isLoading } = useDeliveryDetailQuery(deliveryId);
  const updateMutation = useUpdateDeliveryMutation();
  const { data: orders = [] } = useOrdersQuery();

  const order = delivery ? orders.find((o) => o.id === delivery.orderId) : undefined;

  const [trackingInput, setTrackingInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  useEffect(() => {
    if (delivery) {
      setTrackingInput(delivery.trackingNumber ?? "");
      setNotesInput(delivery.driverNotes ?? "");
    }
  }, [delivery]);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading delivery details..." />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-foreground">Delivery Not Found</h2>
        <p className="text-muted-foreground text-xs">
          No delivery record with ID <span className="font-mono">{deliveryId}</span>.
        </p>
        <Link
          to="/admin/deliveries"
          className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Return to Deliveries
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: delivery.id,
      patch: {
        trackingNumber: trackingInput || undefined,
        driverNotes: notesInput || undefined,
      },
    });
  };

  const initials = delivery.recipientName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 pb-12 text-foreground pt-2 sm:pt-1">
      {/* Back */}
      <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
        <Link
          to="/admin/deliveries"
          className="inline-flex items-center gap-2 h-9 px-4.5 rounded-full border border-border bg-white text-xs font-semibold text-foreground hover:bg-ink hover:text-white hover:border-ink transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="size-3.5" /> Back to Deliveries
        </Link>

        {/* {order && (
          <Link
            to="/admin/orders/$orderId"
            params={{ orderId: order.id }}
            className="inline-flex items-center gap-2 h-9 px-4.5 rounded-full border border-border bg-white text-xs font-semibold text-foreground hover:bg-ink hover:text-white hover:border-ink transition-all shadow-2xs cursor-pointer"
          >
            <Package className="size-3.5" /> View Order
          </Link>
        )} */}
      </div>

      {/* Header Card */}
      <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xs border border-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="size-14 sm:size-16 rounded-full bg-brand-pink text-ink font-bold text-base sm:text-lg grid place-items-center shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                  {delivery.orderId}
                </h1>
                <StatusPill value={delivery.status} />
              </div>
              <p className="text-xs text-muted-foreground font-normal">
                Recipient:{" "}
                <span className="font-medium text-foreground">{delivery.recipientName}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Tracking + Notes */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tracking & Fee Card */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xs border border-border space-y-5">
            <h3 className="font-display font-semibold text-base text-foreground border-b border-border pb-3">
              Delivery Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tracking Number (editable) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="tracking-input"
                  className="text-[11px] font-semibold text-foreground uppercase tracking-wider block"
                >
                  Tracking Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    id="tracking-input"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g. FEZ-2400123456"
                    className="w-full h-10 rounded-xl border border-border bg-white pl-8 pr-3 text-sm font-mono text-foreground font-semibold focus:outline-none focus:border-foreground transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Delivery Fee */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                  Delivery Fee
                </span>
                <div className="h-10 rounded-xl border border-border bg-secondary/40 px-3 flex items-center shadow-2xs">
                  <span className="font-semibold text-sm text-foreground">
                    {formatNaira(delivery.shippingFee)}
                  </span>
                </div>
              </div>

              {/* Courier */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                  Courier
                </span>
                <div className="h-10 rounded-xl border border-border bg-secondary/40 px-3 flex items-center gap-2 shadow-2xs">
                  <Truck className="size-3.5 text-brand-pink shrink-0" />
                  <span className="font-semibold text-sm text-foreground">
                    {delivery.courierName}
                  </span>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                  Est. Delivery Date
                </span>
                <div className="h-10 rounded-xl border border-border bg-secondary/40 px-3 flex items-center gap-2 shadow-2xs">
                  <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-sm text-foreground">
                    {fmt(delivery.estimatedDelivery)}
                  </span>
                </div>
              </div>

              {/* Picked Up At */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                  Picked Up At
                </span>
                <div className="h-10 rounded-xl border border-border bg-secondary/40 px-3 flex items-center gap-2 shadow-2xs">
                  <Clock className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-sm text-foreground">
                    {fmtDt(delivery.dispatchDate)}
                  </span>
                </div>
              </div>

              {/* Delivered At */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                  Delivered At
                </span>
                <div className="h-10 rounded-xl border border-border bg-secondary/40 px-3 flex items-center gap-2 shadow-2xs">
                  <Package className="size-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-sm text-foreground">
                    {fmtDt(delivery.deliveredAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Notes Card */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xs border border-border space-y-3">
            <h3 className="font-display font-semibold text-base text-foreground">
              Driver / Courier Notes
            </h3>
            <p className="text-xs text-muted-foreground">
              Internal notes about this delivery — driver updates, gate access, contact attempts
              etc.
            </p>
            <textarea
              id="delivery-notes"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Enter courier notes, delivery attempts, special instructions…"
              rows={3}
              className="w-full rounded-2xl border border-border bg-white p-3.5 text-xs focus:outline-none focus:border-foreground/60 transition-all resize-y min-h-[90px]"
            />
            <div className="flex justify-end">
              <button
                id="save-delivery-details"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="h-8.5 px-4 rounded-full bg-black text-white font-medium text-xs hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-60"
              >
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Recipient + Order Info */}
        <div className="space-y-5">
          {/* Recipient Card */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xs border border-border space-y-4">
            <h3 className="font-display font-semibold text-base text-foreground border-b border-border/50 pb-3">
              Recipient Details
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px] font-medium block">
                  Full Name
                </span>
                <span className="font-semibold text-sm text-foreground">
                  {delivery.recipientName}
                </span>
              </div>

              {delivery.recipientPhone && (
                <div className="space-y-1 pt-3 border-t border-border/40">
                  <span className="text-muted-foreground text-[11px] font-medium block">Phone</span>
                  <a
                    href={`tel:${delivery.recipientPhone}`}
                    className="flex items-center gap-2 font-medium text-foreground hover:underline"
                  >
                    <Phone className="size-3.5 text-muted-foreground shrink-0" />
                    {delivery.recipientPhone}
                  </a>
                </div>
              )}

              <div className="space-y-1 pt-3 border-t border-border/40">
                <span className="text-muted-foreground text-[11px] font-medium block">
                  Delivery Address
                </span>
                <div className="flex items-start gap-2 text-foreground">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{delivery.address}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      {delivery.city}, {delivery.state}, Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Order Card */}
          {/* <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xs border border-border space-y-4">
            <h3 className="font-display font-semibold text-base text-foreground border-b border-border/50 pb-3">
              Linked Order
            </h3>

            {order ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-foreground">{order.id}</span>
                  <StatusPill value={order.status} />
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px] font-medium block mb-0.5">
                    Customer
                  </span>
                  <p className="font-medium text-foreground">{order.customer}</p>
                  <p className="text-muted-foreground">{order.email}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div>
                    <span className="text-muted-foreground text-[11px] font-medium block">
                      Order Total
                    </span>
                    <span className="font-display font-bold text-base text-foreground">
                      {formatNaira(order.total)}
                    </span>
                  </div>
                  <Link
                    to="/admin/orders/$orderId"
                    params={{ orderId: order.id }}
                    className="inline-flex items-center gap-1 text-xs text-brand-pink font-semibold hover:underline cursor-pointer"
                  >
                    View <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No linked order found for <span className="font-mono">{delivery.orderId}</span>.
              </p>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}
