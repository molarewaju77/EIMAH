import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import { Calendar, X } from "lucide-react";
import { MetricCard, SectionCard } from "@/components/admin/parts";
import { useProductsQuery } from "@/hooks/queries/useProductsQuery";
import { salesSeries } from "@/lib/admin-data";
import { formatNaira } from "@/lib/mock-data";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [{ title: "Analytics — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const RANGES = ["Today", "Last 7 days", "Last 30 days", "This Year", "Custom"];

export function formatCompactNaira(val: number): string {
  if (val >= 1000000) {
    return `₦${(val / 1000000).toFixed(1)}M`;
  }
  if (val >= 1000) {
    return `₦${(val / 1000).toFixed(0)}k`;
  }
  return `₦${val}`;
}

function AnalyticsPage() {
  const { data: products = [], isLoading } = useProductsQuery();
  const [range, setRange] = useState("Last 30 days");
  const [cat, setCat] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading analytics reports..." />
      </div>
    );
  }

  const totalSold = products.reduce((n, p) => n + p.sold, 0);
  const totalRev = products.reduce((n, p) => n + p.sold * p.price, 0);
  const totalProfit = Math.round(totalRev * 0.34);

  const byCategory = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.sold;
      return acc;
    }, {}),
  ).map(([name, sold]) => ({ name: name.replace(/-/g, " "), sold }));

  const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8);

  return (
    <div className="space-y-5 pb-8">
      {/* Title Header Row */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">Analytics</h2>
      </div>

      {/* Filter Controls Bar */}
      <SectionCard className="p-3.5 sm:p-4 border border-border bg-white rounded-2xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <select
            value={range}
            onChange={(e) => {
              setRange(e.target.value);
              if (e.target.value !== "Custom") {
                setStartDate("");
                setEndDate("");
              }
            }}
            className="w-full h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer"
          >
            {RANGES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer"
          >
            <option value="all">All Categories</option>
            {[...new Set(products.map((p) => p.category))].map((c) => (
              <option key={c} value={c}>
                {c.replace(/-/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range Picker (From Date & To Date) */}
        {range === "Custom" && (
          <div className="pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="size-3.5 text-brand-pink" /> Custom Date Range
              </span>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs text-brand-pink font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="size-3" /> Clear Dates
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium focus:border-foreground outline-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium focus:border-foreground outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <MetricCard label="Products sold" value={totalSold.toLocaleString()} delta="+12.4%" />
        <MetricCard label="Revenue generated" value={formatNaira(totalRev)} delta="+8.7%" />
        <MetricCard label="Profit made" value={formatNaira(totalProfit)} delta="+6.1%" />
      </div>

      {/* Revenue & Sales Trend Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <SectionCard title="Revenue Trend" className="xl:col-span-2 border border-border bg-white rounded-3xl shadow-xs p-4 sm:p-6">
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#F590DD" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#F590DD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eee" />
                <XAxis dataKey="m" stroke="#999" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#999"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={formatCompactNaira}
                />
                <Tooltip
                  formatter={(val: any) => [formatNaira(Number(val)), "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                />
                <Area dataKey="revenue" stroke="#F590DD" fill="url(#rev)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Sales Trend" className="border border-border bg-white rounded-3xl shadow-xs p-4 sm:p-6">
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesSeries} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eee" />
                <XAxis dataKey="m" stroke="#999" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#999" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  formatter={(val: any) => [val, "Orders"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                />
                <Line dataKey="orders" stroke="#0a0a0a" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Category Performance & Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard title="Category Performance" className="border border-border bg-white rounded-3xl shadow-xs p-4 sm:p-6">
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#eee" />
                <XAxis
                  type="number"
                  stroke="#999"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#999"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={85}
                />
                <Tooltip
                  formatter={(val: any) => [val, "Units Sold"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                />
                <Bar dataKey="sold" fill="#0a0a0a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Top-Performing Products" className="border border-border bg-white rounded-3xl shadow-xs p-4 sm:p-6">
          <ul className="space-y-3.5 pt-1">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2.5 sm:gap-3">
                <span className="w-5 text-xs text-muted-foreground font-mono shrink-0">0{i + 1}</span>
                <div className="h-9 w-9 rounded-lg overflow-hidden bg-surface-2 shrink-0 border border-border/50">
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold truncate text-foreground">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {p.sold} sold · {formatNaira(p.sold * p.price)}
                  </p>
                </div>
                <div className="w-16 sm:w-24 h-1.5 rounded-full bg-secondary overflow-hidden shrink-0">
                  <div
                    className="h-full bg-brand-pink"
                    style={{ width: `${(p.sold / topProducts[0].sold) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
