import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Eye, X } from "lucide-react";
import { SectionCard, StatusPill, EmptyState } from "@/components/admin/parts";
import { usePaginatedDeliveriesQuery } from "@/hooks/queries/useDeliveriesQuery";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import type { DeliveryStatus } from "@/lib/db/deliveries";

export const Route = createFileRoute("/admin/deliveries")({
  component: DeliveriesPage,
  head: () => ({
    meta: [{ title: "Deliveries — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const STATUSES: DeliveryStatus[] = [
  "Pending Dispatch",
  "Picked Up",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Failed",
];

function CustomFilterIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 6H20M7 12H17M10 18H14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="6" r="2" fill="#F590DD" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="12" r="2" fill="#F590DD" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="18" r="2" fill="#F590DD" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DeliveriesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Mobile Filter Drawer Draft State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("all");

  const { data: paginatedData, isLoading, isFetching } = usePaginatedDeliveriesQuery({
    page,
    pageSize: perPage,
    search: q,
    status: status !== "all" ? status : undefined,
  });

  const deliveries = paginatedData?.deliveries ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const pages = paginatedData?.totalPages ?? 1;

  const activeFilterCount = status !== "all" ? 1 : 0;

  useEffect(() => {
    if (mobileFilterOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [mobileFilterOpen]);

  // Mobile Filter Handlers
  const openFilterDrawer = () => {
    setDraftStatus(status);
    setMobileFilterOpen(true);
  };

  const applyDrawerFilters = () => {
    setStatus(draftStatus);
    setPage(1);
    setMobileFilterOpen(false);
  };

  const resetDrawerFilters = () => {
    setDraftStatus("all");
    setStatus("all");
    setPage(1);
    setMobileFilterOpen(false);
  };

  return (
    <div>
      {/* Title Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">Deliveries</h2>
        <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
          {totalCount} {totalCount === 1 ? "record" : "records"}
        </span>
      </div>

      {/* Mobile Filter Bar */}
      <div className="sm:hidden flex items-center gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            id="delivery-search-mobile"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search order ID, recipient, tracking…"
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-3 text-sm focus:outline-none focus:border-foreground transition-all shadow-xs"
          />
        </div>
        <button
          onClick={openFilterDrawer}
          aria-label="Open filters"
          className="relative h-10 w-10 rounded-xl border border-brand-pink/40 bg-brand-pink/15 text-ink grid place-items-center shrink-0 hover:bg-brand-pink/25 transition-colors shadow-xs cursor-pointer"
        >
          <CustomFilterIcon className="size-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-pink text-ink font-bold text-[10px] grid place-items-center shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Filter Bar */}
      <div className="hidden sm:flex sm:items-center gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            id="delivery-search-desktop"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order ID, recipient name or tracking number…"
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-3 text-sm focus:outline-none focus:border-foreground transition-all shadow-xs"
          />
        </div>

        <select
          id="delivery-status-filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer shrink-0"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table / Cards */}
      <SectionCard className="p-0 overflow-hidden border border-border/40 bg-white rounded-2xl shadow-2xs min-h-[360px]">
        {isLoading || isFetching ? (
          <div className="py-28 flex items-center justify-center">
            <Loader size="lg" label="Loading deliveries..." />
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No deliveries found"
              description="Deliveries will appear here once orders are dispatched."
            />
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden p-3.5 space-y-3">
              {deliveries.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl border border-border/70 bg-white space-y-3 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  {/* Top Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-md border border-border/40">
                      {d.orderId}
                    </span>
                    <StatusPill value={d.status} />
                  </div>

                  {/* Recipient */}
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-brand-pink/15 text-ink font-bold text-xs grid place-items-center shrink-0 border border-brand-pink/30">
                      {d.recipientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {d.recipientName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{d.courierName}</p>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border/50 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Tracking</span>
                      <span className="font-mono font-medium text-foreground">
                        {d.trackingNumber || "—"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground text-[11px] block">Delivery Fee</span>
                      <span className="font-bold text-foreground font-display">{formatNaira(d.shippingFee)}</span>
                    </div>
                  </div>

                  <Link
                    to="/admin/deliveries/$deliveryId"
                    params={{ deliveryId: d.id }}
                    className="w-full h-10 rounded-lg bg-ink text-white font-semibold text-xs hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    View Delivery Details
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[13px] font-semibold text-neutral-600 bg-surface/40">
                    <th className="py-3.5 px-4 whitespace-nowrap">Order ID</th>
                    <th className="py-3.5 px-4">Recipient</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Tracking No.</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Delivery Fee</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-[14px] text-neutral-800">
                  {deliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        <Link
                          to="/admin/deliveries/$deliveryId"
                          params={{ deliveryId: d.id }}
                          className="hover:underline hover:text-brand-pink font-medium text-neutral-900"
                        >
                          {d.orderId}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to="/admin/deliveries/$deliveryId"
                          params={{ deliveryId: d.id }}
                          className="block group"
                        >
                          <p className="font-medium text-[14px] text-neutral-900 group-hover:text-brand-pink transition-colors">{d.recipientName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {d.address}, {d.city}
                          </p>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        {d.trackingNumber || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusPill value={d.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right text-[14px] font-medium text-neutral-900 whitespace-nowrap">
                        {formatNaira(d.shippingFee)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to="/admin/deliveries/$deliveryId"
                          params={{ deliveryId: d.id }}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-neutral-900 inline-block cursor-pointer"
                          aria-label="View delivery"
                        >
                          <Eye className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-border/40 text-xs sm:text-sm">
              <p className="text-muted-foreground font-medium">
                Showing {deliveries.length} of {totalCount}
              </p>
              <div className="inline-flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((n) => Math.max(1, n - 1))}
                  className="h-8.5 px-3.5 rounded-lg border border-border bg-white font-medium text-foreground disabled:opacity-40 hover:bg-secondary transition-colors shadow-2xs cursor-pointer"
                >
                  Prev
                </button>
                <span className="text-muted-foreground font-medium px-1">
                  Page {page} / {pages}
                </span>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage((n) => Math.min(pages, n + 1))}
                  className="h-8.5 px-3.5 rounded-lg border border-border bg-white font-medium text-foreground disabled:opacity-40 hover:bg-secondary transition-colors shadow-2xs cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      {/* Mobile Filter Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 sm:hidden transition-all duration-300",
          mobileFilterOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0 delay-100",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out",
            mobileFilterOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileFilterOpen(false)}
        />

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 shadow-2xl space-y-5 transition-transform duration-300 ease-in-out max-h-[85vh] overflow-y-auto",
            mobileFilterOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto -mt-2 mb-2" />

          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <CustomFilterIcon className="size-5 text-brand-pink" />
              <h3 className="font-display font-bold text-lg text-ink">Filter Deliveries</h3>
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 flex gap-3">
              <button
                onClick={resetDrawerFilters}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={applyDrawerFilters}
                className="flex-1 h-11 rounded-xl bg-brand-pink text-ink font-semibold text-sm hover:bg-ink hover:text-white transition-colors shadow-sm cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
