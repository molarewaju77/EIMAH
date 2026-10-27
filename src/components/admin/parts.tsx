import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  delta,
  positive = true,
  icon,
  tint = "bg-secondary",
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon?: ReactNode;
  tint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-border p-5 md:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon && (
          <div className={cn("grid place-items-center h-9 w-9 rounded-lg", tint)}>{icon}</div>
        )}
      </div>
      <p className="mt-3 font-display font-bold text-2xl md:text-[28px] tracking-tight">{value}</p>
      {delta && (
        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1 text-xs font-semibold",
            positive ? "text-emerald-600" : "text-destructive",
          )}
        >
          {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {delta}
          <span className="text-muted-foreground font-normal ml-1">vs last period</span>
        </p>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  // Green / Positive
  Active: "bg-[#E5FFEE] text-[#16A34A]",
  "In Stock": "bg-[#E5FFEE] text-[#16A34A]",
  Delivered: "bg-[#E5FFEE] text-[#16A34A]",
  Collected: "bg-[#E5FFEE] text-[#16A34A]",
  Successful: "bg-[#E5FFEE] text-[#16A34A]",
  Completed: "bg-[#E5FFEE] text-[#16A34A]",
  Ready: "bg-[#E5FFEE] text-[#16A34A]",
  Open: "bg-[#E5FFEE] text-[#16A34A]",
  Approved: "bg-[#E5FFEE] text-[#16A34A]",

  // Amber / Yellow / Waiting / Attention
  Processing: "bg-[#FFF8E1] text-[#D97706]",
  Pending: "bg-[#FFF8E1] text-[#D97706]",
  "Pending Dispatch": "bg-[#FFF8E1] text-[#D97706]",
  "Low Stock": "bg-[#FFF8E1] text-[#D97706]",
  Scheduled: "bg-[#FFF8E1] text-[#D97706]",
  Waiting: "bg-[#FFF8E1] text-[#D97706]",
  Review: "bg-[#FFF8E1] text-[#D97706]",
  "Under Review": "bg-[#FFF8E1] text-[#D97706]",

  // Blue / Sky
  Paid: "bg-[#E0F2FE] text-[#0284C7]",
  "In Progress": "bg-[#E0F2FE] text-[#0284C7]",
  "Picked Up": "bg-[#E0F2FE] text-[#0284C7]",
  Contacted: "bg-[#E0F2FE] text-[#0284C7]",
  Refunded: "bg-[#E0F2FE] text-[#0284C7]",

  // Purple / Indigo
  Shipped: "bg-[#EEF2FF] text-[#4F46E5]",
  "In Transit": "bg-[#EEF2FF] text-[#4F46E5]",
  "Ready for Pick-up": "bg-[#F3E8FF] text-[#9333EA]",
  "Out for Delivery": "bg-[#F3E8FF] text-[#9333EA]",

  // Pink / Brand
  New: "bg-brand-pink/20 text-ink",

  // Red / Negative
  Cancelled: "bg-[#FEE2E2] text-[#DC2626]",
  Failed: "bg-[#FEE2E2] text-[#DC2626]",
  "Out of Stock": "bg-[#FEE2E2] text-[#DC2626]",
  Rejected: "bg-[#FEE2E2] text-[#DC2626]",

  // Neutral / Gray
  Draft: "bg-[#F3F4F6] text-[#6B7280]",
  Archived: "bg-[#F3F4F6] text-[#6B7280]",
  Disabled: "bg-[#F3F4F6] text-[#6B7280]",
  Inactive: "bg-[#F3F4F6] text-[#6B7280]",
  Closed: "bg-[#F3F4F6] text-[#6B7280]",
};

export function StatusPill({
  value,
  status,
  className,
}: {
  value?: string;
  status?: string;
  className?: string;
}) {
  const displayVal = value || status || "";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap",
        STATUS_STYLES[displayVal] ?? "bg-[#F3F4F6] text-[#6B7280]",
        className,
      )}
    >
      {displayVal}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
      <p className="font-display font-semibold">{title}</p>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const isPZero = className?.includes("p-0");
  return (
    <div className={cn("rounded-2xl bg-white border border-border p-5 md:p-6", className)}>
      {(title || action) && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 mb-4",
            isPZero && "px-4 pt-4 sm:px-5 sm:pt-5 md:px-6 md:pt-6 mb-2",
          )}
        >
          {title && (
            <h3 className="font-display font-semibold text-base md:text-lg text-foreground">
              {title}
            </h3>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
