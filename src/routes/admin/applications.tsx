import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Eye,
  X,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
  Check,
  Copy,
  Trash2,
} from "lucide-react";
import { SectionCard, StatusPill, EmptyState } from "@/components/admin/parts";
import {
  useApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useDeleteApplicationMutation,
} from "@/hooks/queries/useSolutionSubmissionsQuery";
import { type SolutionSubmission, type SolutionStatus, SOLUTIONS_LIST } from "@/lib/solution-data";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/admin/applications")({
  component: ApplicationsPage,
  head: () => ({
    meta: [{ title: "Applications — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const STATUSES: SolutionStatus[] = ["Pending", "In Progress", "Completed"];

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

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ApplicationsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Sorting
  const [sortField, setSortField] = useState<
    "fullName" | "solutionTitle" | "track" | "date" | "status"
  >("date");
  const [sortAsc, setSortAsc] = useState(false);

  // Desktop Date Popover State
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // Mobile Filter Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftService, setDraftService] = useState("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  // Action Menu open ID
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const { data: allApplications = [], isLoading } = useApplicationsQuery({
    solution: serviceFilter !== "all" ? serviceFilter : undefined,
    status: status !== "all" ? status : undefined,
    search: q,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const updateStatusMutation = useUpdateApplicationStatusMutation();
  const deleteMutation = useDeleteApplicationMutation();

  const activeFilterCount =
    (status !== "all" ? 1 : 0) + (serviceFilter !== "all" ? 1 : 0) + (startDate || endDate ? 1 : 0);

  useEffect(() => {
    if (mobileFilterOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [mobileFilterOpen]);

  // Sorting
  const sortedApplications = useMemo(() => {
    const list = [...allApplications];
    list.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (sortField === "date") {
        return sortAsc
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return list;
  }, [allApplications, sortField, sortAsc]);

  const totalCount = sortedApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const paginatedApplications = sortedApplications.slice((page - 1) * perPage, page * perPage);

  const handleSort = (field: "fullName" | "solutionTitle" | "track" | "date" | "status") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Mobile Filter Handlers
  const openFilterDrawer = () => {
    setDraftStatus(status);
    setDraftService(serviceFilter);
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setMobileFilterOpen(true);
  };

  const applyDrawerFilters = () => {
    setStatus(draftStatus);
    setServiceFilter(draftService);
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setPage(1);
    setMobileFilterOpen(false);
  };

  const resetDrawerFilters = () => {
    setDraftStatus("all");
    setDraftService("all");
    setDraftStartDate("");
    setDraftEndDate("");
    setStatus("all");
    setServiceFilter("all");
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div>
      {/* Title & Primary Action Header Row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
            Applications
          </h2>
        </div>
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
            placeholder="Search applications…"
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
      <div className="hidden sm:flex sm:items-center gap-2.5 mb-5 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, ID, email, phone, business…"
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-3 text-sm focus:outline-none focus:border-foreground transition-all shadow-xs"
          />
        </div>

        {/* Service / Program Filter Dropdown */}
        <select
          value={serviceFilter}
          onChange={(e) => {
            setServiceFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer shrink-0 max-w-[240px] truncate"
        >
          <option value="all">All services & programs</option>
          {SOLUTIONS_LIST.map((sol) => (
            <option key={sol} value={sol}>
              {sol}
            </option>
          ))}
        </select>

        {/* Date Filter Dropdown */}
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
              <h3 className="font-display font-bold text-lg text-foreground">
                Filter Applications
              </h3>
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
                Service / Program
              </label>
              <select
                value={draftService}
                onChange={(e) => setDraftService(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground cursor-pointer"
              >
                <option value="all">All services & programs</option>
                {SOLUTIONS_LIST.map((sol) => (
                  <option key={sol} value={sol}>
                    {sol}
                  </option>
                ))}
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
                Status
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

          <div className="flex gap-3 pt-2">
            <button
              onClick={resetDrawerFilters}
              className="flex-1 h-11 rounded-xl border border-border font-semibold text-xs text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={applyDrawerFilters}
              className="flex-1 h-11 rounded-xl bg-brand-pink text-ink font-semibold text-xs hover:bg-ink hover:text-white transition-colors cursor-pointer shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table Card */}
      <SectionCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader size="lg" />
            <p className="text-xs text-muted-foreground mt-3 font-medium">
              Loading applications...
            </p>
          </div>
        ) : paginatedApplications.length === 0 ? (
          <div className="py-16 text-center px-4">
            <EmptyState
              title="No applications found"
              description={
                q || status !== "all" || serviceFilter !== "all" || startDate || endDate
                  ? "No submissions match the selected search criteria or filters."
                  : "Customer submissions for consultations and training programs will appear here."
              }
            />
          </div>
        ) : (
          <>
            {/* Mobile Card View (sm:hidden) */}
            <div className="sm:hidden p-3.5 space-y-3">
              {paginatedApplications.map((app) => {
                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-border/70 bg-white space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-md border border-border/40">
                        ID : {app.id}
                      </span>
                      <StatusPill status={app.status} />
                    </div>

                    <div>
                      <Link
                        to="/admin/applications/$applicationId"
                        params={{ applicationId: app.id }}
                        className="font-bold text-base text-foreground hover:text-brand-pink transition-colors block"
                      >
                        {app.fullName}
                      </Link>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {app.solutionTitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2.5 border-t border-border/50">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Submission Date
                        </span>
                        <span className="text-muted-foreground font-medium">
                          {formatDate(app.date)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Fee Paid
                        </span>
                        <span className="font-bold text-sm text-foreground font-display">
                          {formatNaira(app.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <Link
                        to="/admin/applications/$applicationId"
                        params={{ applicationId: app.id }}
                        className="w-full h-10 rounded-xl bg-ink text-white hover:bg-black font-semibold text-xs flex items-center justify-center transition-colors shadow-2xs"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/70 bg-surface/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3.5 px-5">Applicant</th>
                    <th className="py-3.5 px-4">Service / Program</th>
                    <th className="py-3.5 px-4">Submission Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {paginatedApplications.map((app) => {
                    const isActionOpen = openActionId === app.id;

                    return (
                      <tr key={app.id} className="hover:bg-surface/60 transition-colors group">
                        {/* Applicant Name & ID (ID : SOL-xxxx) */}
                        <td className="py-4 px-5">
                          <Link
                            to="/admin/applications/$applicationId"
                            params={{ applicationId: app.id }}
                            className="font-semibold text-foreground group-hover:text-brand-pink transition-colors block text-sm"
                          >
                            {app.fullName}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                            ID : <span className="font-mono">{app.id}</span>
                          </p>
                        </td>

                        {/* Service / Program Applied */}
                        <td className="py-4 px-4 text-sm text-foreground font-medium">
                          <div>{app.solutionTitle}</div>
                          {app.businessName && (
                            <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">
                              {app.businessName}
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(app.date)}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusPill status={app.status} />
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            {/* View Eye Button */}
                            <Link
                              to="/admin/applications/$applicationId"
                              params={{ applicationId: app.id }}
                              className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              title="View Application Details"
                            >
                              <Eye className="size-4" />
                            </Link>

                            {/* Quick More Menu */}
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={() => setOpenActionId(isActionOpen ? null : app.id)}
                                className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                              >
                                <MoreHorizontal className="size-4" />
                              </button>

                              {isActionOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setOpenActionId(null)}
                                  />
                                  <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-border shadow-lg z-30 py-1.5 text-xs text-left animate-in fade-in-50 zoom-in-95">
                                    <div className="px-3 py-1 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/50 mb-1">
                                      CHANGE STATUS
                                    </div>
                                    {STATUSES.map((st) => (
                                      <button
                                        key={st}
                                        type="button"
                                        onClick={() => {
                                          updateStatusMutation.mutate({ id: app.id, status: st });
                                          setOpenActionId(null);
                                        }}
                                        className={cn(
                                          "w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-secondary transition-colors cursor-pointer",
                                          app.status === st
                                            ? "font-bold text-foreground"
                                            : "text-muted-foreground",
                                        )}
                                      >
                                        <span>{st}</span>
                                        {app.status === st && (
                                          <Check className="size-3.5 text-brand-pink" />
                                        )}
                                      </button>
                                    ))}

                                    <div className="border-t border-border/50 my-1" />

                                    <Link
                                      to="/admin/applications/$applicationId"
                                      params={{ applicationId: app.id }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 text-foreground hover:bg-secondary transition-colors cursor-pointer"
                                      onClick={() => setOpenActionId(null)}
                                    >
                                      <Eye className="size-3.5 text-muted-foreground" />
                                      <span>View details</span>
                                    </Link>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        copyToClipboard(app.id, "Application ID");
                                        setOpenActionId(null);
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 text-foreground hover:bg-secondary transition-colors cursor-pointer"
                                    >
                                      <Copy className="size-3.5 text-muted-foreground" />
                                      <span>Copy ID</span>
                                    </button>

                                    <div className="border-t border-border/50 my-1" />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (
                                          confirm(
                                            `Are you sure you want to delete application ${app.id}?`,
                                          )
                                        ) {
                                          deleteMutation.mutate(app.id);
                                        }
                                        setOpenActionId(null);
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer font-medium"
                                    >
                                      <Trash2 className="size-3.5 text-destructive" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Table Footer with Pagination (Matching existing Admin design) */}
        {!isLoading && sortedApplications.length > 0 && (
          <div className="py-4 px-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">{(page - 1) * perPage + 1}</span>–
              <span className="font-semibold text-foreground">
                {Math.min(page * perPage, totalCount)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{totalCount}</span> applications
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none text-foreground font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-2 font-medium text-foreground">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none text-foreground font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
