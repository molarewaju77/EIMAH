import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Download, FileDown, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { SectionCard, StatusPill } from "@/components/admin/parts";
import { useAdminStore } from "@/lib/admin-store";
import { useProductsQuery } from "@/hooks/queries/useProductsQuery";
import { useCategoriesQuery } from "@/hooks/queries/useCategoriesQuery";
import { useOrdersQuery } from "@/hooks/queries/useOrdersQuery";
import { useCustomersQuery } from "@/hooks/queries/useCustomersQuery";
import { buildReportData, exportAndDownloadReport, formatReportDate } from "@/lib/report-generator";
import { adminCategories, type ExportRow } from "@/lib/admin-data";

export const Route = createFileRoute("/qsfvnthzoh/reports")({
  component: ReportsPage,
  head: () => ({
    meta: [{ title: "Reports — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const REPORT_TYPES = [
  "Sales records",
  "Product sales history",
  "Revenue report",
  "Profit report",
  "Customer purchases",
];

const RANGES = ["Today", "Last 7 days", "Last 30 days", "This Year", "Custom range"];
const FORMATS = ["CSV", "Excel"] as const;

function ReportsPage() {
  const { exports, addExport } = useAdminStore();
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategoriesQuery();
  const { data: products = [], isLoading: productsLoading } = useProductsQuery();
  const { data: orders = [], isLoading: ordersLoading } = useOrdersQuery();
  const { data: customers = [], isLoading: customersLoading } = useCustomersQuery();

  const [type, setType] = useState(REPORT_TYPES[0]);
  const [prod, setProd] = useState("all");
  const [cat, setCat] = useState("all");
  const [range, setRange] = useState(RANGES[2]);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [fmt, setFmt] = useState<(typeof FORMATS)[number]>("CSV");
  const [isExporting, setIsExporting] = useState(false);

  const isDataLoading = productsLoading || ordersLoading || customersLoading || categoriesLoading;

  // Resolve categories from useCategoriesQuery, with dynamic products and adminCategories fallback
  const categories = useMemo(() => {
    const list: { slug: string; name: string }[] = [];
    const seen = new Set<string>();

    // 1. From useCategoriesQuery
    for (const c of categoriesData) {
      if (c.slug && !seen.has(c.slug.toLowerCase())) {
        seen.add(c.slug.toLowerCase());
        list.push({ slug: c.slug, name: c.name });
      }
    }

    // 2. From products in database/mock (ensures all categories assigned to products are available)
    for (const p of products) {
      if (p.category && !seen.has(p.category.toLowerCase())) {
        seen.add(p.category.toLowerCase());
        const formattedName = p.category.charAt(0).toUpperCase() + p.category.slice(1);
        list.push({ slug: p.category, name: formattedName });
      }
    }

    // 3. Fallback to adminCategories
    if (list.length === 0) {
      for (const ac of adminCategories) {
        if (ac.slug && !seen.has(ac.slug.toLowerCase())) {
          seen.add(ac.slug.toLowerCase());
          list.push({ slug: ac.slug, name: ac.name });
        }
      }
    }

    return list;
  }, [categoriesData, products]);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (cat === "all") return products;
    return products.filter((p) => p.category?.toLowerCase() === cat.toLowerCase());
  }, [products, cat]);

  // When category changes, if currently selected product is not in that category, reset product to "all"
  const handleCategoryChange = (newCat: string) => {
    setCat(newCat);
    if (newCat !== "all" && prod !== "all") {
      const match = products.find((p) => p.slug === prod);
      if (match && match.category?.toLowerCase() !== newCat.toLowerCase()) {
        setProd("all");
      }
    }
  };

  // Real-time record count calculation based on current selections
  const previewData = useMemo(() => {
    return buildReportData({
      type,
      range,
      customStart,
      customEnd,
      prod,
      cat,
      orders,
      products,
      customers,
    });
  }, [type, range, customStart, customEnd, prod, cat, orders, products, customers]);

  // Main Export button click handler
  const onExport = () => {
    if (isDataLoading) {
      toast.info("Preparing data, please wait...");
      return;
    }

    setIsExporting(true);
    try {
      const report = buildReportData({
        type,
        range,
        customStart,
        customEnd,
        prod,
        cat,
        orders,
        products,
        customers,
      });

      if (report.totalRecords === 0) {
        toast.warn("No records match the selected date and filters. Exporting empty template.");
      }

      // Download file to admin's machine
      exportAndDownloadReport(report, fmt);

      // Record in recent exports
      const id = `EXP-${1050 + Math.floor(Math.random() * 500)}`;
      const rangeLabel =
        range === "Custom range" && customStart && customEnd
          ? `${formatReportDate(customStart)} – ${formatReportDate(customEnd)}`
          : range;

      addExport({
        id,
        name: `${type} export`,
        type,
        range: rangeLabel,
        format: fmt,
        date: new Date().toISOString().slice(0, 10),
        status: "Ready",
        customStart,
        customEnd,
        prod,
        cat,
        recordCount: report.totalRecords,
      });

      toast.success(`${type} downloaded successfully (${report.totalRecords} records).`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("An error occurred while generating the report.");
    } finally {
      setIsExporting(false);
    }
  };

  // Re-download from Recent Exports table
  const handleDownloadRecent = (e: ExportRow) => {
    try {
      const report = buildReportData({
        type: e.type,
        range: e.range,
        customStart: e.customStart,
        customEnd: e.customEnd,
        prod: e.prod || "all",
        cat: e.cat || "all",
        orders,
        products,
        customers,
      });

      exportAndDownloadReport(report, e.format);
      toast.success(`Downloaded ${e.name} (${e.format})`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to download ${e.name}`);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title Header Row */}
      <div className="flex items-center justify-between gap-4 mb-1">
        <div>
          <h2 className="font-display font-[600] text-xl sm:text-2xl text-foreground mb-2">
            Reports & Exports
          </h2>
          {/* <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Generate and download analytical records for sales, inventory, revenue, and customer behavior.
          </p> */}
        </div>
      </div>

      {/* Top Card: Configure Export */}
      <SectionCard
        title="Configure export"
        className="border border-border bg-white rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
      >
        {/* Row 1: Select Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          <Field label="Report type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:border-foreground outline-none cursor-pointer"
            >
              {REPORT_TYPES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category">
            <select
              value={cat}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:border-foreground outline-none cursor-pointer"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Product">
            <select
              value={prod}
              onChange={(e) => setProd(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:border-foreground outline-none cursor-pointer"
            >
              <option value="all">
                {cat === "all"
                  ? "All products"
                  : `All ${categories.find((c) => c.slug.toLowerCase() === cat.toLowerCase())?.name || ""} products`}
              </option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date range">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:border-foreground outline-none cursor-pointer"
            >
              {RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          {/* Conditional Custom Date Range Pickers */}
          {range === "Custom range" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 col-span-1 sm:col-span-2 lg:col-span-4 border-t border-border/40">
              <Field label="Start date">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:border-foreground outline-none cursor-pointer"
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-white px-3 text-xs sm:text-sm font-medium focus:border-foreground outline-none cursor-pointer"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Row 2: Format & Export Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Format:
              </span>
              <div className="flex gap-1.5 rounded-xl border border-border bg-surface/50 p-1">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFmt(f)}
                    className={`h-8 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      fmt === f
                        ? "bg-brand-pink text-ink shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Records Preview Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Ready to export:{" "}
                <strong className="text-foreground font-semibold">
                  {previewData.totalRecords}
                </strong>{" "}
                {previewData.totalRecords === 1 ? "record" : "records"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onExport}
            disabled={isExporting || isDataLoading}
            className="h-10 px-6 rounded-xl bg-brand-pink text-ink font-semibold text-xs sm:text-sm hover:bg-ink hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs shrink-0 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating...
              </>
            ) : isDataLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Loading data...
              </>
            ) : (
              <>
                <FileDown className="size-4" /> Export Report
              </>
            )}
          </button>
        </div>
      </SectionCard>

      {/* Middle Card: Live Report Preview */}
      <SectionCard
        title={`Report Preview: ${previewData.title}`}
        action={
          <span className="text-xs font-semibold text-muted-foreground px-2.5 py-1 rounded-full bg-secondary">
            Showing {Math.min(previewData.rows.length, 5)} of {previewData.totalRecords} records
          </span>
        }
        className="border border-border bg-white rounded-3xl p-0 overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto p-0">
          <table className="w-full text-xs sm:text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold bg-surface/50">
                {previewData.headers.map((h) => {
                  const isSellingPriceCol = h.includes("Selling Price without Discount");
                  return (
                    <th
                      key={h}
                      className={`py-3 px-3.5 whitespace-nowrap ${
                        isSellingPriceCol ? "text-foreground font-bold bg-brand-pink/20" : ""
                      }`}
                    >
                      {h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {previewData.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(1, previewData.headers.length)}
                    className="text-center py-10 text-xs sm:text-sm text-muted-foreground"
                  >
                    No records found matching current selection.
                  </td>
                </tr>
              ) : (
                previewData.rows.slice(0, 5).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-secondary/30 transition-colors">
                    {row.map((val, cIdx) => {
                      const headerName = previewData.headers[cIdx] || "";
                      const isSellingPriceCol = headerName.includes("Selling Price without Discount");
                      const isCurrency =
                        typeof val === "number" &&
                        (headerName.includes("(NGN)") ||
                          headerName.includes("Price") ||
                          headerName.includes("Revenue") ||
                          headerName.includes("Profit") ||
                          headerName.includes("Subtotal") ||
                          headerName.includes("Fee") ||
                          headerName.includes("Total") ||
                          headerName.includes("Spent") ||
                          headerName.includes("Value"));

                      return (
                        <td
                          key={cIdx}
                          className={`py-3 px-3.5 whitespace-nowrap text-muted-foreground ${
                            isSellingPriceCol ? "font-semibold text-foreground bg-brand-pink/10" : ""
                          }`}
                        >
                          {isCurrency ? `₦${Number(val).toLocaleString()}` : String(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {previewData.rows.length > 5 && (
          <div className="px-4 py-2 bg-surface/30 border-t border-border/50 text-right text-xs text-muted-foreground">
            + {previewData.rows.length - 5} more records included when exported
          </div>
        )}
      </SectionCard>

      {/* Bottom Card: Full Width Recent Exports */}
      <SectionCard
        title="Recent exports"
        className="border border-border bg-white rounded-3xl p-0 overflow-hidden shadow-sm"
      >
        {/* Mobile Card View (sm:hidden) */}
        <div className="sm:hidden p-4 space-y-3">
          {exports.length === 0 ? (
            <div className="text-center py-8 text-[14px] font-[500] text-muted-foreground">
              No reports exported yet.
            </div>
          ) : (
            exports.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-2xl border border-border bg-white space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-[500] text-[14px] text-muted-foreground">{e.name}</h4>
                    <p className="font-mono text-[11px] text-muted-foreground/80">{e.id}</p>
                  </div>
                  <StatusPill value={e.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[14px] pt-2.5 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground/80 block text-xs">Type</span>
                    <span className="font-[500] text-[14px] text-muted-foreground">{e.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/80 block text-xs">Format</span>
                    <span className="font-[500] text-[14px] text-muted-foreground">{e.format}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/80 block text-xs">Date Range</span>
                    <span className="font-[500] text-[14px] text-muted-foreground">{e.range}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/80 block text-xs">Export Date</span>
                    <span className="font-[500] text-[14px] text-muted-foreground">
                      {formatReportDate(e.date)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadRecent(e)}
                  className="w-full h-10 rounded-xl bg-ink text-white font-[500] text-[14px] hover:bg-black transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="size-4" /> Download Report
                </button>
              </div>
            ))
          )}
        </div>

        {/* Desktop Aligned Full-Width Table View (hidden sm:block) */}
        <div className="hidden sm:block overflow-x-auto p-0">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground font-semibold bg-surface/40">
                <th className="py-3.5 px-4 whitespace-nowrap">Report</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Type</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Range</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Format</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-[14px] font-[500]">
              {exports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[14px] font-[500] text-muted-foreground">
                    No reports exported yet. Click &quot;Export Report&quot; above to generate one.
                  </td>
                </tr>
              ) : (
                exports.map((e) => (
                  <tr key={e.id} className="hover:bg-secondary/30 transition-colors text-[14px] font-[500] text-muted-foreground">
                    <td className="py-3.5 px-4">
                      <p className="font-[500] text-[14px] text-muted-foreground">{e.name}</p>
                      <p className="text-xs text-muted-foreground/80 font-mono">{e.id}</p>
                    </td>
                    <td className="py-3.5 px-4 text-[14px] font-[500] text-muted-foreground whitespace-nowrap">
                      {e.type}
                    </td>
                    <td className="py-3.5 px-4 text-[14px] font-[500] text-muted-foreground whitespace-nowrap">
                      {e.range}
                    </td>
                    <td className="py-3.5 px-4 text-[14px] font-[500] text-muted-foreground whitespace-nowrap">
                      {e.format}
                    </td>
                    <td className="py-3.5 px-4 text-[14px] font-[500] text-muted-foreground whitespace-nowrap">
                      {formatReportDate(e.date)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusPill value={e.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDownloadRecent(e)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-[13px] font-[500] hover:bg-secondary transition-colors cursor-pointer text-foreground"
                      >
                        <Download className="size-3.5" /> Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 w-full">
      <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block">
        {label}
      </span>
      {children}
    </div>
  );
}
