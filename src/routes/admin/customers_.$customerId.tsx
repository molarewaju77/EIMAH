import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Save, Package, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { StatusPill } from "@/components/admin/parts";
import {
  useCustomerDetailQuery,
  useUpdateCustomerMutation,
} from "@/hooks/queries/useCustomersQuery";
import { useOrdersQuery } from "@/hooks/queries/useOrdersQuery";
import { usePos } from "@/lib/pos-store";
import { formatNaira } from "@/lib/mock-data";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/admin/customers_/$customerId")({
  component: CustomerDetailsPage,
});

function CustomerDetailsPage() {
  const { customerId } = Route.useParams();
  const nav = useNavigate();
  const pos = usePos();
  const { data: customer, isLoading } = useCustomerDetailQuery(customerId);
  const updateMutation = useUpdateCustomerMutation();
  const { data: orders = [] } = useOrdersQuery();

  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (customer) setNotes(customer.notes || "");
  }, [customer]);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading customer details..." />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-foreground">Customer Not Found</h2>
        <p className="text-muted-foreground text-xs">
          No customer was found with ID <span className="font-mono">{customerId}</span>.
        </p>
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Return to Customers
        </Link>
      </div>
    );
  }

  const custOrders = orders.filter(
    (o) =>
      o.email.toLowerCase() === customer.email.toLowerCase() ||
      o.customer.toLowerCase() === customer.name.toLowerCase(),
  );

  const handleSaveNotes = async () => {
    await updateMutation.mutateAsync({ id: customer.id, patch: { notes } });
  };

  const handleCreatePosOrder = () => {
    pos.setCustomer({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
      city: customer.city || "Lagos",
      state: customer.state || "Lagos",
    });
    toast.success(`Customer ${customer.name} selected for POS order`);
    nav({ to: "/admin/pos" });
  };

  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const avgOrderValue = customer.orders > 0 ? Math.round(customer.spent / customer.orders) : 0;

  return (
    <div className="space-y-6 pb-12 text-foreground pt-2 sm:pt-1 max-w-[1400px] mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <Link
          to="/admin/customers"
          className="inline-flex items-center justify-center gap-2 h-9 px-4.5 rounded-full border border-border bg-white text-xs font-semibold text-foreground hover:bg-ink hover:text-white hover:border-ink transition-all shadow-2xs cursor-pointer w-fit"
        >
          <ArrowLeft className="size-3.5" /> Back to Customers
        </Link>

        <button
          onClick={handleCreatePosOrder}
          className="inline-flex items-center justify-center gap-2 h-9 px-4.5 rounded-full bg-brand-pink text-ink text-xs font-semibold hover:bg-ink hover:text-white transition-all shadow-2xs cursor-pointer w-full sm:w-auto"
        >
          <ShoppingCart className="size-3.5" /> Create Order in POS
        </button>
      </div>

      {/* Main Customer Header Card */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-2xs border border-border space-y-6">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
            <div className="size-14 sm:size-16 rounded-full bg-brand-pink text-ink font-bold text-base sm:text-lg grid place-items-center shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground truncate">
                {customer.name}
              </h1>
              <p className="text-xs text-muted-foreground font-normal">
                Customer ID:{" "}
                <span className="font-mono font-medium text-foreground">{customer.id}</span>
              </p>
              <p className="text-xs text-muted-foreground font-normal break-all">
                {customer.email}
              </p>
              <p className="text-xs text-muted-foreground font-normal">
                Member since{" "}
                {customer.dateJoined
                  ? new Date(customer.dateJoined).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "May 10, 2025"}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <StatusPill value={customer.status} />
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Metrics & Order History */}
        <div className="lg:col-span-2 space-y-5">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-white p-5 border border-border shadow-2xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Orders
              </p>
              <p className="font-display font-bold text-2xl text-foreground mt-1">
                {customer.orders}
              </p>
            </div>
            <div className="rounded-3xl bg-white p-5 border border-border shadow-2xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Spent
              </p>
              <p className="font-display font-bold text-2xl text-brand-pink mt-1">
                {formatNaira(customer.spent)}
              </p>
            </div>
            <div className="rounded-3xl bg-white p-5 border border-border shadow-2xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Avg. Order Value
              </p>
              <p className="font-display font-bold text-2xl text-foreground mt-1">
                {formatNaira(avgOrderValue)}
              </p>
            </div>
          </div>

          {/* Clean Order History Section */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-2xs border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                <Package className="size-4 text-brand-pink" /> Order History ({custOrders.length})
              </h3>
            </div>

            {custOrders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs bg-surface/50 rounded-2xl border border-dashed border-border">
                No orders recorded for this customer yet.
              </div>
            ) : (
              <div className="space-y-3">
                {custOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl border border-border/80 bg-white hover:border-brand-pink/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-foreground">{o.id}</span>
                        <StatusPill value={o.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          {new Date(o.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>·</span>
                        <span>{o.deliveryMethod || "Courier Delivery"}</span>
                        {o.trackingId && (
                          <>
                            <span>·</span>
                            <span>
                              Tracking ID:{" "}
                              <span className="font-mono font-medium text-foreground">
                                {o.trackingId}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <span className="font-bold text-sm text-foreground">
                        {formatNaira(o.total)}
                      </span>
                      <Link
                        to="/admin/orders/$orderId"
                        params={{ orderId: o.id }}
                        className="inline-flex items-center gap-1 text-xs text-brand-pink font-semibold hover:underline cursor-pointer"
                      >
                        View Order <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Contact Details & Notes */}
        <div className="space-y-5">
          {/* Contact Details Card */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-2xs border border-border space-y-5">
            <h3 className="font-display font-semibold text-base sm:text-lg text-foreground border-b border-border/50 pb-3.5">
              Contact Details
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[13px] font-semibold text-muted-foreground block">
                  Full Name
                </span>
                <p className="text-[15px] font-medium text-foreground">{customer.name}</p>
              </div>

              <div className="space-y-1 pt-4 border-t border-border/50">
                <span className="text-[13px] font-semibold text-muted-foreground block">
                  Email Address
                </span>
                <p className="text-[15px] font-medium text-foreground break-all">
                  <a
                    href={`mailto:${customer.email}`}
                    className="hover:underline hover:text-brand-pink transition-colors"
                  >
                    {customer.email}
                  </a>
                </p>
              </div>

              <div className="space-y-1 pt-4 border-t border-border/50">
                <span className="text-[13px] font-semibold text-muted-foreground block">
                  Phone Number
                </span>
                <p className="text-[15px] font-medium text-foreground">
                  {customer.phone ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="hover:underline hover:text-brand-pink transition-colors"
                    >
                      {customer.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground font-normal">Not provided</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Internal Customer Notes Card */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-2xs border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-display font-semibold text-base text-foreground">
                Internal Customer Notes
              </h3>
              <button
                onClick={handleSaveNotes}
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1 text-xs text-brand-pink font-semibold hover:underline cursor-pointer disabled:opacity-50"
              >
                <Save className="size-3" /> {updateMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about customer preferences, VIP status, or special instructions..."
              className="w-full rounded-2xl border border-border bg-background p-3.5 text-xs focus:border-foreground focus:ring-1 focus:ring-foreground outline-none min-h-[110px] resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
