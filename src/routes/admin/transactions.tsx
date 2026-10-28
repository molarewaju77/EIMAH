import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search, Calendar, ChevronDown, ShoppingBag, Briefcase } from "lucide-react";
import { SectionCard, StatusPill, EmptyState } from "@/components/admin/parts";
import { useTransactionsQuery } from "@/hooks/queries/useTransactionsQuery";
import { type PaymentStatus } from "@/lib/admin-data";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { formatDateString } from "@/routes/admin/payments";

export const Route = createFileRoute("/admin/transactions")({
  component: TransactionsPage,
  head: () => ({
    meta: [{ title: "Transactions — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

type UnifiedTransaction = {
  id: string;
  type: "Order" | "Solution";
  customerName: string;
  customerEmail?: string;
  refId: string;
  solutionCategory?: "Business" | "Learning";
  amount: number;
  method: string;
  status: PaymentStatus;
  date: string;
};

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

export default function TransactionsPage() {
  const { data: allTxns = [], isLoading: isLoadingTxns } = useTransactionsQuery();

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Order" | "Solution">("all");
  const [statusFilter, setStatusFilter] = useState("all");
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
  const [draftTypeFilter, setDraftTypeFilter] = useState<"all" | "Order" | "Solution">("all");
  const [draftStatusFilter, setDraftStatusFilter] = useState("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  // Read transactions exclusively from public.transactions table
  const unifiedList = useMemo<UnifiedTransaction[]>(() => {
    return allTxns
      .map((t) => ({
        id: t.id,
        type:
          (t.type as "Order" | "Solution") || (t.orderId?.startsWith("SOL") ? "Solution" : "Order"),
        customerName: t.customer,
        refId: t.orderId,
        amount: t.amount,
        method: t.method,
        status: t.status,
        date: t.date,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTxns]);

  // Apply filters
  const filteredList = useMemo(() => {
    return unifiedList.filter((item) => {
      // Type Filter
      if (typeFilter !== "all" && item.type !== typeFilter) return false;

      // Status Filter
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // Date Filters
      if (startDate && new Date(item.date) < new Date(startDate)) return false;
      if (endDate) {
        const endIso = new Date(`${endDate}T23:59:59.999Z`);
        if (new Date(item.date) > endIso) return false;
      }

      // Search Query
      if (q.trim()) {
        const query = q.toLowerCase().trim();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesName = item.customerName.toLowerCase().includes(query);
        const matchesEmail = item.customerEmail?.toLowerCase().includes(query) || false;
        const matchesRef = item.refId.toLowerCase().includes(query);
        const matchesCat = item.solutionCategory?.toLowerCase().includes(query) || false;
        if (!matchesId && !matchesName && !matchesEmail && !matchesRef && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedList, typeFilter, statusFilter, startDate, endDate, q]);

  const totalCount = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const paginatedList = filteredList.slice((page - 1) * perPage, page * perPage);

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (startDate || endDate ? 1 : 0);

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
    setDraftTypeFilter(typeFilter);
    setDraftStatusFilter(statusFilter);
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setMobileFilterOpen(true);
  };

  const applyDrawerFilters = () => {
    setTypeFilter(draftTypeFilter);
    setStatusFilter(draftStatusFilter);
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setPage(1);
    setMobileFilterOpen(false);
  };

  const resetDrawerFilters = () => {
    setDraftTypeFilter("all");
    setDraftStatusFilter("all");
    setDraftStartDate("");
    setDraftEndDate("");
    setTypeFilter("all");
    setStatusFilter("all");
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

  const isLoading = isLoadingTxns;

  return (
    <div className="space-y-5 pb-8">
      {/* Page Title */}
      <div className="flex items-center justify-between gap-4 mb-1">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
            Transactions
          </h2>
        </div>
      </div>

      {/* Filter Controls Bar */}
      {/* 1. Mobile Search & Filter Bar (sm:hidden) */}
      <div className="sm:hidden flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search txn ID, customer, order..."
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

      {/* 2. Desktop Filter Bar (hidden sm:flex) */}
      <div className="hidden sm:flex items-center gap-2.5 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search transaction ID, customer name, email, or order ID..."
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-3 text-sm focus:outline-none focus:border-foreground transition-all shadow-xs"
          />
        </div>

        {/* Type Filter Dropdown */}
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as any);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer shrink-0"
        >
          <option value="all">All Transaction Types</option>
          <option value="Order">Store Orders</option>
          <option value="Solution">Solutions & Training</option>
        </select>

        {/* Custom Date Range Popover */}
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

          {datePopoverOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setDatePopoverOpen(false)} />
              <div className="absolute right-0 mt-2 z-40 w-56 bg-white rounded-2xl border border-border shadow-xl p-3.5 space-y-3 animate-in fade-in-50 zoom-in-95">
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

        {/* Status Filter Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer shrink-0"
        >
          <option value="all">All Statuses</option>
          <option value="Successful">Successful</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {/* Main Unified Table View */}
      <SectionCard className="p-0 overflow-hidden border border-border bg-white rounded-2xl shadow-sm min-h-[360px]">
        {isLoading ? (
          <div className="py-28 flex items-center justify-center">
            <Loader size="lg" label="Loading transaction history..." />
          </div>
        ) : paginatedList.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No transactions found"
              description="Try clearing date / type / status filters or adjusting your search query."
            />
          </div>
        ) : (
          <>
            {/* Mobile Card View (sm:hidden) */}
            <div className="sm:hidden p-3.5 space-y-3">
              {paginatedList.map((t) => (
                <div
                  key={`${t.type}-${t.id}`}
                  className="p-4 rounded-2xl border border-border bg-white space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                          {t.type === "Order" ? "Order" : "Solution"}
                        </span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="font-mono text-xs font-medium text-foreground">
                          {t.id}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{t.customerName}</h4>
                    </div>
                    <StatusPill value={t.status} />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px] block">
                        Ref:{" "}
                        <span className="font-mono text-neutral-800 font-medium">{t.refId}</span> •{" "}
                        {t.method} • {formatDateString(t.date)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-foreground font-display">
                        {formatNaira(t.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Aligned Table View (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[13px] font-semibold text-neutral-600 bg-surface/40">
                    <th className="py-3.5 px-4 whitespace-nowrap">Transaction ID</th>
                    <th className="py-3.5 px-4">Customer / Applicant</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Type</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Reference ID</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Amount</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Method</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-[14px] text-neutral-800">
                  {paginatedList.map((t) => (
                    <tr
                      key={`${t.type}-${t.id}`}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        {t.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[14px] text-neutral-900">
                        {t.customerName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-xs text-neutral-700">
                          {t.type === "Order" ? "Order" : "Solution"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        {t.refId}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[14px] font-medium text-neutral-900 whitespace-nowrap">
                        {formatNaira(t.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        {t.method}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusPill value={t.status} />
                      </td>
                      <td className="py-3.5 px-4 text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                        {formatDateString(t.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-border/40 text-xs sm:text-sm">
              <p className="text-muted-foreground font-medium">
                Showing {paginatedList.length} of {totalCount} transactions
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
                  Page {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
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
              <h3 className="font-display font-bold text-lg text-ink">Filter Transactions</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Transaction Type
              </label>
              <select
                value={draftTypeFilter}
                onChange={(e) => setDraftTypeFilter(e.target.value as any)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground cursor-pointer"
              >
                <option value="all">All Transaction Types</option>
                <option value="Order">Store Orders</option>
                <option value="Solution">Solutions & Training</option>
              </select>
            </div>

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
                Payment Status
              </label>
              <select
                value={draftStatusFilter}
                onChange={(e) => setDraftStatusFilter(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Successful">Successful</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <div className="flex gap-2 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={resetDrawerFilters}
                className="flex-1 h-11 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyDrawerFilters}
                className="flex-1 h-11 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer shadow-xs"
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
