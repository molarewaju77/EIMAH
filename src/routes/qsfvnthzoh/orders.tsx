import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Eye, X, Plus, Calendar, ChevronDown, Check } from "lucide-react";
import { SectionCard, StatusPill, EmptyState } from "@/components/admin/parts";
import { type AdminOrderStatus } from "@/lib/admin-store";
import { usePaginatedOrdersQuery } from "@/hooks/queries/useOrdersQuery";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/qsfvnthzoh/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [{ title: "Courier Orders — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const STATUSES: AdminOrderStatus[] = ["Paid", "Processing", "Shipped", "Delivered"];

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

function OrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Desktop Date Popover State
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // Mobile Filter Drawer Draft State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  const { data: paginatedData, isLoading, isFetching } = usePaginatedOrdersQuery({
    page,
    pageSize: perPage,
    search: q,
    status: status !== "all" ? status : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    deliveryMethod: "Courier",
  });

  const orders = paginatedData?.orders ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const pages = paginatedData?.totalPages ?? 1;

  const activeFilterCount =
    (status !== "all" ? 1 : 0) + (startDate || endDate ? 1 : 0);

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
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setMobileFilterOpen(true);
  };

  const applyDrawerFilters = () => {
    setStatus(draftStatus);
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setPage(1);
    setMobileFilterOpen(false);
  };

  const resetDrawerFilters = () => {
    setDraftStatus("all");
    setDraftStartDate("");
    setDraftEndDate("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
    setMobileFilterOpen(false);
  };

  // Desktop Date Popover Handlers
  const openDatePopover = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setDatePopoverOpen((v) => !v);
  };

  const applyDesktopDate = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPage(1);
    setDatePopoverOpen(false);
  };

  const clearDesktopDate = () => {
    setTempStartDate("");
    setTempEndDate("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    setDatePopoverOpen(false);
  };

  return (
    <div>
      {/* Title & Primary Action Header Row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">Courier Orders</h2>
        <Link
          to="/qsfvnthzoh/pos"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-brand-pink text-ink font-semibold text-xs sm:text-sm hover:bg-ink hover:text-white transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <Plus className="size-4" /> Create Order (POS)
        </Link>
      </div>

      {/* Filter Controls Bar */}
      {/* 1. Mobile Filter Bar (sm:hidden) */}
      <div className="sm:hidden flex items-center gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search orders…"
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-3 text-sm focus:outline-none focus:border-foreground transition-all shadow-xs"
          />
        </div>

        {/* Custom Pink Filter Button */}
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

      {/* 2. Desktop Filter Bar (hidden sm:flex) */}
      <div className="hidden sm:flex sm:items-center gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order ID, tracking ID, customer, email, phone…"
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-3 text-sm focus:outline-none focus:border-foreground transition-all shadow-xs"
          />
        </div>

        {/* Desktop Date Range Filter Button & Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={openDatePopover}
            className="h-10 rounded-xl border border-border bg-white text-foreground hover:bg-secondary/40 px-3 text-xs sm:text-sm font-medium shadow-xs cursor-pointer inline-flex items-center gap-2 transition-colors"
          >
            <Calendar className="size-4 text-muted-foreground" />
            <span>Date</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>

          {/* Date Picker Popover Dropdown */}
          {datePopoverOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDatePopoverOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-40 w-56 bg-white rounded-2xl border border-border shadow-xl p-3.5 space-y-3 animate-in fade-in-50 zoom-in-95">
                {/* From / To Date Inputs Stacked Vertically */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="w-full h-9 rounded-xl border border-border bg-white px-2.5 text-xs font-medium focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="w-full h-9 rounded-xl border border-border bg-white px-2.5 text-xs font-medium focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>

                {/* Popover Action Buttons: Reset & Apply */}
                <div className="flex gap-2 pt-1 border-t border-border/60">
                  <button
                    type="button"
                    onClick={clearDesktopDate}
                    className="flex-1 h-8.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={applyDesktopDate}
                    className="flex-1 h-8.5 rounded-xl bg-brand-pink text-ink text-xs font-semibold hover:bg-ink hover:text-white transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer shrink-0"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Mobile Filter Bottom Sheet Drawer (sm:hidden) */}
      <div
        className={cn(
          "fixed inset-0 z-50 sm:hidden transition-all duration-300",
          mobileFilterOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0 delay-100",
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-ink/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out",
            mobileFilterOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileFilterOpen(false)}
        />

        {/* Bottom Sheet Card */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 shadow-2xl space-y-5 transition-transform duration-300 ease-in-out max-h-[85vh] overflow-y-auto",
            mobileFilterOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          {/* Handle Bar */}
          <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto -mt-2 mb-2" />

          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <CustomFilterIcon className="size-5 text-brand-pink" />
              <h3 className="font-display font-bold text-lg text-foreground">Filter Orders</h3>
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
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={draftStartDate}
                onChange={(e) => setDraftStartDate(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                To Date
              </label>
              <input
                type="date"
                value={draftEndDate}
                onChange={(e) => setDraftEndDate(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Order Status
              </label>
              <select
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground cursor-pointer"
              >
                <option value="all">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
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

      {/* Orders Table / Cards with Loader Container */}
      <SectionCard className="p-0 overflow-hidden border border-border/40 bg-white rounded-2xl shadow-2xs min-h-[360px]">
        {isLoading || isFetching ? (
          <div className="py-28 flex items-center justify-center">
            <Loader size="lg" label="Loading customer orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No orders found"
              description="Try adjusting your date range, search query, or status filter."
            />
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden p-3.5 space-y-3">
              {orders.map((o) => {
                const initials = o.customer
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2);
                const itemCount = o.items.reduce((n, i) => n + i.qty, 0);

                return (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl border border-border/70 bg-white space-y-3.5 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    {/* Top Row: Order ID badge & Status pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-foreground bg-secondary/80 px-2.5 py-1 rounded-md border border-border/40">
                        {o.id}
                      </span>
                      <StatusPill value={o.status} />
                    </div>

                    {/* Customer info with initials avatar */}
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-brand-pink/15 text-ink font-bold text-xs grid place-items-center shrink-0 border border-brand-pink/30">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {o.customer}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{o.email}</p>
                      </div>
                    </div>

                    {/* Date, Tracking, Items count & Total amount */}
                    <div className="flex items-center justify-between text-xs pt-2.5 border-t border-border/50 gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-muted-foreground font-medium">
                          {new Date(o.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          · {itemCount} {itemCount === 1 ? "item" : "items"}
                        </p>
                        {o.trackingId && (
                          <p className="text-[11px] text-muted-foreground font-normal truncate">
                            Tracking:{" "}
                            <span className="font-mono font-medium text-foreground">
                              {o.trackingId}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Total
                        </span>
                        <span className="font-bold text-base text-foreground font-display">
                          {formatNaira(o.total)}
                        </span>
                      </div>
                    </div>

                    {/* Modern Dark Action Button */}
                    <Link
                      to="/qsfvnthzoh/orders/$orderId"
                      params={{ orderId: o.id }}
                      className="w-full h-10 rounded-lg bg-ink text-white font-semibold text-xs hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      View Order Details
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Desktop Aligned Table View */}
            <div className="hidden sm:block overflow-x-auto p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[13px] font-semibold text-neutral-600">
                    <th className="py-3.5 px-4 whitespace-nowrap">Order ID</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Tracking ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Items</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Total</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-[14px] text-neutral-800">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        <Link
                          to="/qsfvnthzoh/orders/$orderId"
                          params={{ orderId: o.id }}
                          className="hover:underline hover:text-brand-pink font-medium text-neutral-900"
                        >
                          {o.id}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[13px] font-normal text-neutral-700 whitespace-nowrap">
                        <span className="bg-secondary/60 px-2 py-0.5 rounded border border-border/40 text-neutral-800">
                          {o.trackingId || "—"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to="/qsfvnthzoh/orders/$orderId"
                          params={{ orderId: o.id }}
                          className="block group"
                        >
                          <p className="font-medium text-[14px] text-neutral-900 group-hover:text-brand-pink transition-colors">
                            {o.customer}
                          </p>
                          <p className="text-xs text-muted-foreground">{o.email}</p>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        {new Date(o.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        {o.items.reduce((n, i) => n + i.qty, 0)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusPill value={o.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right text-[14px] font-medium text-neutral-900 whitespace-nowrap">
                        {formatNaira(o.total)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to="/qsfvnthzoh/orders/$orderId"
                          params={{ orderId: o.id }}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-neutral-900 inline-block cursor-pointer"
                          aria-label="View order"
                        >
                          <Eye className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-border/40 text-xs sm:text-sm">
              <p className="text-muted-foreground font-medium">
                Showing {orders.length} of {totalCount}
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
    </div>
  );
}
