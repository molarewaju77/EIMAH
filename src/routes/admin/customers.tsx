import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Eye, X, Calendar, ChevronDown } from "lucide-react";
import { SectionCard, StatusPill, EmptyState } from "@/components/admin/parts";
import { usePaginatedCustomersQuery } from "@/hooks/queries/useCustomersQuery";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
  head: () => ({
    meta: [{ title: "Customers — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

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

function CustomersPage() {
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

  const {
    data: paginatedData,
    isLoading,
    isFetching,
  } = usePaginatedCustomersQuery({
    page,
    pageSize: perPage,
    search: q,
    status: status !== "all" ? status : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const customers = paginatedData?.customers ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const pages = paginatedData?.totalPages ?? 1;

  const activeFilterCount = (status !== "all" ? 1 : 0) + (startDate || endDate ? 1 : 0);

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
      {/* Title Header Row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">Customers</h2>
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
            placeholder="Search name, email, phone…"
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
      <div className="hidden sm:flex items-center gap-2.5 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search customers by name, email or phone…"
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-3 text-sm focus:outline-none focus:border-foreground transition-all shadow-xs"
          />
        </div>

        {/* Custom Date Joined Popover Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={openDatePopover}
            className="h-10 rounded-xl border border-border bg-white text-foreground hover:bg-secondary/40 px-3 text-xs sm:text-sm font-medium shadow-xs cursor-pointer inline-flex items-center gap-2 transition-colors"
          >
            <Calendar className="size-4 text-muted-foreground" />
            <span>Date Joined</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>

          {/* Date Picker Popover Dropdown (Matches Orders page layout) */}
          {datePopoverOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setDatePopoverOpen(false)} />
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

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer shrink-0"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="New">New</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Standalone Table / Cards Container */}
      <SectionCard className="p-0 overflow-hidden border border-border/40 bg-white rounded-2xl shadow-2xs min-h-[360px]">
        {isLoading || isFetching ? (
          <div className="py-28 flex items-center justify-center">
            <Loader size="lg" label="Loading customer profiles..." />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No customers found"
              description="Try clearing filters or adjusting your search."
            />
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden p-3.5 space-y-3">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-border/70 bg-white space-y-3.5 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <StatusPill value={c.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-border/50">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Phone</span>
                      <span className="font-medium text-foreground">{c.phone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Orders</span>
                      <span className="font-medium text-foreground">{c.orders}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Date Joined</span>
                      <span className="font-medium text-foreground">
                        {c.dateJoined
                          ? new Date(c.dateJoined).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Total Spend</span>
                      <span className="font-bold text-foreground font-display">
                        {formatNaira(c.spent)}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/admin/customers/$customerId"
                    params={{ customerId: c.id }}
                    className="w-full h-10 rounded-lg bg-ink text-white font-semibold text-xs hover:bg-black transition-colors inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    View Customer Profile
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop Aligned Table View */}
            <div className="hidden sm:block overflow-x-auto p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[13px] font-semibold text-neutral-600">
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Phone</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Date Joined</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Orders</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Spend</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-[14px] text-neutral-800">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          to="/admin/customers/$customerId"
                          params={{ customerId: c.id }}
                          className="hover:underline"
                        >
                          <p className="font-medium text-[14px] text-neutral-900 hover:text-brand-pink transition-colors">
                            {c.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        {c.phone || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        {c.dateJoined
                          ? new Date(c.dateJoined).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-[14px] font-normal text-neutral-800 whitespace-nowrap">
                        {c.orders}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[14px] font-medium text-neutral-900 whitespace-nowrap">
                        {formatNaira(c.spent)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusPill value={c.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to="/admin/customers/$customerId"
                          params={{ customerId: c.id }}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-neutral-900 transition-colors inline-block cursor-pointer"
                          aria-label="View customer profile"
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
                Showing {customers.length} of {totalCount}
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

      {/* Mobile Filter Draw-Up Modal (sm:hidden) */}
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
              <h3 className="font-display font-bold text-lg text-ink">Filter Customers</h3>
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
                Status
              </label>
              <select
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="New">New</option>
                <option value="Inactive">Inactive</option>
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
    </div>
  );
}
