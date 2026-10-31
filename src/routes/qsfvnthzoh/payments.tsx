import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, X, Calendar, ChevronDown, ShoppingBag, Briefcase, Eye } from "lucide-react";
import { MetricCard, SectionCard, StatusPill, EmptyState } from "@/components/admin/parts";
import {
  useTransactionsQuery,
  usePaginatedTransactionsQuery,
} from "@/hooks/queries/useTransactionsQuery";
import {
  useSolutionPaymentsQuery,
  usePaginatedSolutionPaymentsQuery,
} from "@/hooks/queries/useContentQuery";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/qsfvnthzoh/payments")({
  component: PaymentsPage,
  head: () => ({
    meta: [{ title: "Payments — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

export function formatDateString(dateStr: string): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

function PaymentsPage() {
  /*
  // ---------- COMMENTED OUT PAYMENTS PAGE IMPLEMENTATION ----------
  const [paymentTab, setPaymentTab] = useState<"orders" | "solutions">("orders");

  // Common Filter State
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Debounce search query to trigger API call
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // Metric Cards Global Totals
  const { data: allSolutions = [] } = useSolutionPaymentsQuery();
  const { data: allTxns = [] } = useTransactionsQuery();

  // Server-side Paginated & Filtered Database Queries
  const {
    data: txnsResult,
    isLoading: isLoadingTxns,
    isFetching: isFetchingTxns,
  } = usePaginatedTransactionsQuery({
    page,
    pageSize: perPage,
    search: debouncedQ,
    status,
    fromDate: startDate || undefined,
    toDate: endDate || undefined,
  });

  const {
    data: solutionsResult,
    isLoading: isLoadingSolutions,
    isFetching: isFetchingSolutions,
  } = usePaginatedSolutionPaymentsQuery({
    page,
    pageSize: perPage,
    search: debouncedQ,
    status,
    category: categoryFilter,
    fromDate: startDate || undefined,
    toDate: endDate || undefined,
  });

  // Desktop Date Popover State
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // Mobile Filter Drawer Draft State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftCategoryFilter, setDraftCategoryFilter] = useState("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  const activeFilterCount =
    (status !== "all" ? 1 : 0) +
    (startDate || endDate ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0);

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
    setDraftCategoryFilter(categoryFilter);
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setMobileFilterOpen(true);
  };

  const applyDrawerFilters = () => {
    setStatus(draftStatus);
    setCategoryFilter(draftCategoryFilter);
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setPage(1);
    setMobileFilterOpen(false);
  };

  const resetDrawerFilters = () => {
    setDraftStatus("all");
    setDraftCategoryFilter("all");
    setDraftStartDate("");
    setDraftEndDate("");
    setStatus("all");
    setCategoryFilter("all");
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

  // Totals for Order Payments Metrics
  const orderTotals = {
    all: allTxns.reduce((n, t) => n + t.amount, 0),
    Successful: allTxns.filter((t) => t.status === "Successful").reduce((n, t) => n + t.amount, 0),
    Pending: allTxns.filter((t) => t.status === "Pending").reduce((n, t) => n + t.amount, 0),
    Failed: allTxns.filter((t) => t.status === "Failed").reduce((n, t) => n + t.amount, 0),
    Refunded: allTxns.filter((t) => t.status === "Refunded").reduce((n, t) => n + t.amount, 0),
  };

  // Totals for Solution Payments Metrics
  const solutionTotals = {
    all: allSolutions.reduce((n, t) => n + t.amount, 0),
    Business: allSolutions
      .filter((t) => t.category === "Business")
      .reduce((n, t) => n + t.amount, 0),
    Learning: allSolutions
      .filter((t) => t.category === "Learning")
      .reduce((n, t) => n + t.amount, 0),
    Successful: allSolutions.filter((t) => t.status === "Successful").length,
    Pending: allSolutions.filter((t) => t.status === "Pending").length,
  };

  const orders = txnsResult?.transactions || [];
  const ordersTotalCount = txnsResult?.totalCount || 0;
  const ordersTotalPages = txnsResult?.totalPages || 1;

  const solutions = solutionsResult?.solutionPayments || [];
  const solutionsTotalCount = solutionsResult?.totalCount || 0;
  const solutionsTotalPages = solutionsResult?.totalPages || 1;
  */

  return (
    <div className="py-16 text-center text-muted-foreground text-sm">
      Payments page is deprecated in favor of unified Transactions.
    </div>
  );
}
