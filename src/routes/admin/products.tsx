import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, X, Eye, MoreVertical, Upload, Loader2, Star } from "lucide-react";
import { toast } from "react-toastify";
import { SectionCard, EmptyState, StatusPill } from "@/components/admin/parts";
import { useAdminStore, type AdminProduct } from "@/lib/admin-store";
import {
  usePaginatedProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/hooks/queries/useProductsQuery";
import { useCategoriesQuery } from "@/hooks/queries/useCategoriesQuery";
import { stockStatusFor } from "@/lib/admin-data";
import type { ProductAttribute } from "@/lib/mock-data";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { uploadImageToSupabase } from "@/lib/storage";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
  head: () => ({
    meta: [{ title: "Products — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const emptyForm = {
  id: "",
  name: "",
  slug: "",
  category: "clothing",
  description: "",
  price: 0,
  costPrice: 0,
  compareAt: undefined as number | undefined,
  attributes: [] as ProductAttribute[],
  variants: [] as any[],
  stock: 0,
  sku: "",
  weight: undefined as number | undefined,
  status: "Active" as AdminProduct["status"],
  images: [] as string[],
  featured: false,
  sold: 0,
  createdAt: new Date().toISOString(),
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

function ProductsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [stock, setStock] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const {
    data: paginatedData,
    isLoading,
    isFetching,
  } = usePaginatedProductsQuery({
    page,
    pageSize: perPage,
    category: cat,
    search: q,
    status: status !== "all" ? status : undefined,
  });

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();
  const { data: categories = [] } = useCategoriesQuery();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [preview, setPreview] = useState<AdminProduct | null>(null);
  const [confirmDel, setConfirmDel] = useState<AdminProduct | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [draftCat, setDraftCat] = useState("all");
  const [draftStock, setDraftStock] = useState("all");
  const [draftStatus, setDraftStatus] = useState("all");

  const openFilterDrawer = () => {
    setDraftCat(cat);
    setDraftStock(stock);
    setDraftStatus(status);
    setMobileFilterOpen(true);
  };

  const applyDrawerFilters = () => {
    setCat(draftCat);
    setStock(draftStock);
    setStatus(draftStatus);
    setPage(1);
    setMobileFilterOpen(false);
  };

  const resetDrawerFilters = () => {
    setDraftCat("all");
    setDraftStock("all");
    setDraftStatus("all");
    setCat("all");
    setStock("all");
    setStatus("all");
    setPage(1);
    setMobileFilterOpen(false);
  };

  const products = paginatedData?.products ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const pages = paginatedData?.totalPages ?? 1;

  const activeFilterCount =
    (cat !== "all" ? 1 : 0) + (stock !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0);

  const filtered = useMemo(() => {
    if (stock === "all") return products;
    return products.filter((p) => stockStatusFor(p.stock) === stock);
  }, [products, stock]);

  const rows = filtered;

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setShowForm(true);
  };

  const handleExport = () => {
    const headers = ["ID", "Name", "SKU", "Category", "Price", "Stock", "Status"];
    const exportRows = rows.map((p) => [
      p.id,
      p.name,
      p.sku,
      p.category,
      p.price,
      p.stock,
      p.status,
    ]);
    const csvContent = [
      headers.join(","),
      ...exportRows.map((r) => r.map((v) => `"${v}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success("Products exported to CSV");
  };

  const onSave = async (data: AdminProduct) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, patch: data });
    } else {
      await createMutation.mutateAsync({
        ...data,
        id: `eimah-${Math.random().toString(36).slice(2, 8)}`,
      });
    }
    setShowForm(false);
  };
  const onDelete = async () => {
    if (confirmDel) {
      await deleteMutation.mutateAsync(confirmDel.id);
      setConfirmDel(null);
    }
  };

  return (
    <div>
      {/* Title & Primary Action Header Row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">Products</h2>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-brand-pink text-ink font-semibold text-xs sm:text-sm hover:bg-ink hover:text-white transition-colors shrink-0 shadow-sm"
        >
          <Plus className="size-4" /> Add Product
        </button>
      </div>

      {/* Filter Controls Bar */}
      {/* 1. Mobile Filter Bar (sm:hidden) */}
      <div className="sm:hidden flex items-center gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or SKU…"
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-3 text-sm focus:outline-none focus:border-foreground transition-all shadow-xs"
          />
        </div>

        {/* Custom Pink Filter Button */}
        <button
          onClick={openFilterDrawer}
          aria-label="Open filters"
          className="relative h-10 w-10 rounded-xl border border-brand-pink/40 bg-brand-pink/15 text-ink grid place-items-center shrink-0 hover:bg-brand-pink/25 transition-colors shadow-xs"
        >
          <CustomFilterIcon className="size-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-pink text-ink font-bold text-[10px] grid place-items-center shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Desktop Filter Bar (hidden sm:flex) - Preserved exactly as desktop */}
      <div className="hidden sm:flex items-center gap-2.5 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or SKU…"
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-3 text-sm focus:outline-none focus:border-foreground transition-all shadow-xs"
          />
        </div>

        <select
          value={cat}
          onChange={(e) => {
            setCat(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer shrink-0"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={stock}
          onChange={(e) => {
            setStock(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer shrink-0"
        >
          <option value="all">All stock</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground shadow-xs cursor-pointer shrink-0"
        >
          <option value="all">All status</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>
      </div>

      <SectionCard className="p-0 overflow-hidden border border-border bg-white rounded-2xl shadow-sm min-h-[360px]">
        {isLoading || isFetching ? (
          <div className="py-28 flex items-center justify-center">
            <Loader size="lg" label="Loading products catalog..." />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No products match your filters"
              description="Try clearing filters or add a new product."
            />
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden p-4 space-y-3">
              {rows.map((p) => {
                const isOut = Number(p.stock ?? 0) <= 0;
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-border bg-white space-y-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-surface-2 shrink-0 border border-border/60">
                        <img
                          src={p.images[0]}
                          alt=""
                          className={cn(
                            "h-full w-full object-cover",
                            isOut && "grayscale",
                          )}
                        />
                        {p.featured && (
                          <span
                            title="Featured product"
                            className="absolute top-0.5 left-0.5 size-4 rounded-full bg-brand-pink text-ink shadow-xs grid place-items-center ring-1 ring-white/90"
                          >
                            <Star className="size-2.5 fill-current stroke-none" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {p.name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                      <StatusPill value={isOut ? "Out of Stock" : p.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{p.stock} in stock</span>
                        <StatusPill value={stockStatusFor(p.stock)} />
                      </div>
                      <span className="font-bold text-sm text-foreground">
                        {formatNaira(p.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setPreview(p)}
                        className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="size-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="size-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmDel(p)}
                        className="h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Aligned Table View */}
            <div className="hidden sm:block overflow-x-auto p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[13px] font-semibold text-neutral-600">
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">SKU</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Category</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Stock</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Price</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-[14px] text-neutral-800">
                  {rows.map((p) => {
                    const isOut = Number(p.stock ?? 0) <= 0;
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-surface-2 shrink-0 border border-border/60">
                              <img
                                src={p.images[0]}
                                alt=""
                                className={cn("h-full w-full object-cover", isOut && "grayscale")}
                              />
                              {p.featured && (
                                <span
                                  title="Featured product"
                                  className="absolute top-0.5 left-0.5 size-4 rounded-full bg-brand-pink text-ink shadow-xs grid place-items-center ring-1 ring-white/90"
                                >
                                  <Star className="size-2.5 fill-current stroke-none" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[14px] text-neutral-900 truncate">
                                {p.name}
                              </p>
                              <div className="text-xs text-muted-foreground truncate max-w-[260px]">
                                {p.attributes && p.attributes.length > 0
                                  ? p.attributes.map((a) => a.values.join(", ")).join(" | ")
                                  : "No attributes"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                          {p.sku}
                        </td>
                        <td className="py-3.5 px-4 capitalize text-[14px] font-normal text-neutral-700 whitespace-nowrap">
                          {p.category.replace(/-/g, " ")}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-normal text-[14px] text-neutral-800">
                              {p.stock}
                            </span>
                            <StatusPill value={stockStatusFor(p.stock)} />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-[14px] font-medium text-neutral-900 whitespace-nowrap">
                          {formatNaira(p.price)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusPill value={p.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === p.id ? null : p.id);
                              }}
                              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-neutral-900 transition-colors"
                              aria-label="Actions"
                            >
                              <MoreVertical className="size-4" />
                            </button>

                            {openMenuId === p.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                  }}
                                />
                                <div className="absolute right-0 top-full mt-1 z-40 min-w-[130px] rounded-xl border border-border bg-white p-1.5 shadow-lg text-xs font-medium space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      setPreview(p);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-foreground text-left transition-colors"
                                  >
                                    <Eye className="size-3.5 text-muted-foreground" />
                                    View
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      openEdit(p);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-foreground text-left transition-colors"
                                  >
                                    <Edit3 className="size-3.5 text-muted-foreground" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      setConfirmDel(p);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-left transition-colors"
                                  >
                                    <Trash2 className="size-3.5 text-red-500" />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-border text-xs sm:text-sm">
          <p className="text-muted-foreground font-medium">
            Showing {rows.length} of {totalCount}
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
      </SectionCard>

      {showForm && (
        <ProductForm
          initial={editing ?? (emptyForm as unknown as AdminProduct)}
          onClose={() => setShowForm(false)}
          onSave={onSave}
          categories={categories.map((c) => c.slug)}
        />
      )}
      {preview && <PreviewModal p={preview} onClose={() => setPreview(null)} />}
      {confirmDel && (
        <Modal onClose={() => setConfirmDel(null)}>
          <h3 className="font-display font-bold text-xl">Delete product?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This will remove <b>{confirmDel.name}</b>. This action can't be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setConfirmDel(null)}
              className="h-10 px-4 rounded-full border border-border text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="h-10 px-4 rounded-full bg-destructive text-white text-sm font-semibold"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Mobile Bottom Sheet Filter Drawer with Smooth Entrance & Exit Animations */}
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

        {/* Drawer Body sliding up/down smoothly */}
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
              <h3 className="font-display font-bold text-lg text-foreground">Filter Products</h3>
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={draftCat}
                onChange={(e) => setDraftCat(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Stock Level
              </label>
              <select
                value={draftStock}
                onChange={(e) => setDraftStock(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground"
              >
                <option value="all">All stock</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:outline-none focus:border-foreground"
              >
                <option value="all">All status</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              onClick={resetDrawerFilters}
              className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
            >
              Reset
            </button>
            <button
              onClick={applyDrawerFilters}
              className="flex-1 h-11 rounded-xl bg-brand-pink text-ink font-semibold text-sm hover:bg-ink hover:text-white transition-colors shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <button
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in"
      />
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary/80 hover:bg-secondary border border-border/50 text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer shadow-2xs"
          aria-label="Close"
        >
          <X className="size-4 stroke-[2.5]" />
        </button>
        {children}
      </div>
    </div>
  );
}

function PreviewModal({ p, onClose }: { p: AdminProduct; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="aspect-square rounded-lg overflow-hidden bg-surface-2">
          <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground capitalize">
            {p.category.replace(/-/g, " ")}
          </p>
          <h3 className="mt-1 font-display font-bold text-xl">{p.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
          <div className="mt-4 space-y-1.5 text-sm">
            <p>
              <span className="text-muted-foreground">SKU:</span>{" "}
              <span className="font-mono">{p.sku}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Selling:</span> {formatNaira(p.price)}
            </p>
            <p>
              <span className="text-muted-foreground">Cost:</span> {formatNaira(p.costPrice)}
            </p>
            <p>
              <span className="text-muted-foreground">Stock:</span> {p.stock}
            </p>
            {p.weight !== undefined && p.weight !== null && Number(p.weight) > 0 ? (
              <p>
                <span className="text-muted-foreground">Weight:</span> {p.weight} kg
              </p>
            ) : null}
            {p.attributes &&
              p.attributes.map((a) => (
                <p key={a.name}>
                  <span className="text-muted-foreground">{a.name}:</span> {a.values.join(", ")}
                </p>
              ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ProductForm({
  initial,
  onClose,
  onSave,
  categories,
}: {
  initial: AdminProduct;
  onClose: () => void;
  onSave: (p: AdminProduct) => void;
  categories: string[];
}) {
  const [f, setF] = useState<AdminProduct>(initial);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const initialDiscount =
    initial.compareAt && initial.compareAt > initial.price
      ? Math.round(((initial.compareAt - initial.price) / initial.compareAt) * 100)
      : "";
  const [discountPct, setDiscountPct] = useState<number | string>(initialDiscount);
  const [basePriceInput, setBasePriceInput] = useState<number | string>(
    () => initial.compareAt || initial.price || "",
  );
  const [attrRawValues, setAttrRawValues] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    initial.attributes?.forEach((a, i) => {
      map[i] = a.values.join(", ");
    });
    return map;
  });

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  const upd = <K extends keyof AdminProduct>(k: K, v: AdminProduct[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  const recalculatePrices = (baseVal: number, pctVal: number) => {
    if (baseVal <= 0) {
      setF((prev) => ({ ...prev, price: 0, compareAt: undefined }));
      return;
    }
    if (pctVal > 0 && pctVal < 100) {
      const discounted = Math.round(baseVal * (1 - pctVal / 100));
      setF((prev) => ({ ...prev, price: discounted, compareAt: baseVal }));
    } else {
      setF((prev) => ({ ...prev, price: baseVal, compareAt: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-2 sm:p-6 overflow-y-auto">
      <button
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in"
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col my-auto max-h-[85dvh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="h-14 sm:h-16 px-5 sm:px-6 border-b border-border flex items-center justify-between shrink-0 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
              {initial.id ? "Edit Product" : "Add Product"}
            </h3>
            {initial.id && f.sku && (
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-secondary/80 text-muted-foreground border border-border/50">
                SKU: {f.sku}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-secondary/80 hover:bg-secondary border border-border/50 text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer shadow-2xs"
            aria-label="Close modal"
          >
            <X className="size-4 stroke-[2.5]" />
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          <Row label="Product name" required>
            <input
              value={f.name}
              onChange={(e) => upd("name", e.target.value)}
              placeholder="e.g. Oversized Wool Blazer"
              className="fld"
            />
          </Row>
          <Row label="Description" required>
            <textarea
              value={f.description}
              onChange={(e) => upd("description", e.target.value)}
              rows={3}
              placeholder="Describe product details, fit, and materials…"
              className="fld resize-none"
            />
          </Row>

          <Row label="Category" required>
            <select
              value={f.category}
              onChange={(e) => upd("category", e.target.value)}
              className="fld cursor-pointer"
            >
              {categories.map((c: any) => (
                <option
                  key={typeof c === "string" ? c : c.slug}
                  value={typeof c === "string" ? c : c.slug}
                >
                  {typeof c === "string" ? c.replace(/-/g, " ") : c.name}
                </option>
              ))}
            </select>
          </Row>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Row label="Cost price (₦)" required>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={f.costPrice === 0 ? "" : f.costPrice}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  upd("costPrice", cleaned === "" ? 0 : parseInt(cleaned, 10));
                }}
                placeholder="0"
                className="fld"
              />
            </Row>
            <Row label="Selling price (₦)" required>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={basePriceInput}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  setBasePriceInput(cleaned);
                  const num = cleaned === "" ? 0 : parseInt(cleaned, 10);
                  const pct = Number(discountPct) || 0;
                  recalculatePrices(num, pct);
                }}
                placeholder="0"
                className="fld font-medium"
              />
            </Row>
            <Row label="Discount Percentage (%)" optional>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={discountPct}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    setDiscountPct(cleaned);
                    const pct = cleaned === "" ? 0 : Math.min(99, parseInt(cleaned, 10) || 0);
                    const baseVal = Number(basePriceInput) || 0;
                    recalculatePrices(baseVal, pct);
                  }}
                  placeholder="1 to 99"
                  className="fld pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  %
                </span>
              </div>
            </Row>
            <Row label="Stock quantity" required>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={f.stock === 0 ? "" : f.stock}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  upd("stock", cleaned === "" ? 0 : parseInt(cleaned, 10));
                }}
                placeholder="0"
                className="fld"
              />
            </Row>
            <Row label="Weight (kg)" required>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={f.weight !== undefined && f.weight !== null ? f.weight : ""}
                onChange={(e) =>
                  upd("weight", e.target.value === "" ? undefined : parseFloat(e.target.value))
                }
                placeholder="e.g. 0.35"
                className="fld font-medium"
              />
            </Row>
            <Row label="Status" required>
              <select
                value={f.status}
                onChange={(e) => upd("status", e.target.value as AdminProduct["status"])}
                className="fld cursor-pointer"
              >
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </Row>
          </div>

          {/* Featured Product Toggle */}
          <div className="p-4 rounded-2xl border border-border bg-surface/50 flex items-center justify-between gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-foreground block">
                Featured Product
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Highlight this product in homepage featured showcase collections
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={Boolean(f.featured)}
                onChange={(e) => upd("featured", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-pink"></div>
            </label>
          </div>

          {/* Customer Pays Summary Banner */}
          {f.compareAt && f.compareAt > f.price && f.price > 0 && (
            <div className="p-3 rounded-xl bg-brand-yellow/20 border border-brand-yellow/50 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-ink">
                Customer Pays:{" "}
                <span className="text-sm font-bold text-foreground">
                  ₦{f.price.toLocaleString()}
                </span>
              </span>
              <span className="text-muted-foreground">
                Original: <span className="line-through">₦{f.compareAt.toLocaleString()}</span> (
                {discountPct}% OFF · Saves ₦{(f.compareAt - f.price).toLocaleString()})
              </span>
            </div>
          )}

          {/* Product Images Manager */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                Product Images <span className="text-rose-500 font-bold text-sm">*</span>
              </label>
              <span className="text-xs text-muted-foreground">
                Upload image files or add image URLs
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {f.images.filter(Boolean).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl border border-border overflow-hidden group bg-surface shadow-2xs"
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-brand-pink text-ink text-[10px] font-bold shadow-2xs">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const next = f.images.filter((_, idx) => idx !== i);
                      upd("images", next.length > 0 ? next : []);
                    }}
                    className="absolute top-1.5 right-1.5 h-6.5 w-6.5 rounded-full bg-black/75 hover:bg-red-600 text-white grid place-items-center transition-colors cursor-pointer shadow-xs z-10"
                    aria-label="Remove image"
                  >
                    <X className="size-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ))}

              <label
                className={cn(
                  "aspect-square rounded-xl border-2 border-dashed border-border hover:border-brand-pink bg-surface/50 hover:bg-brand-pink/5 transition-all flex flex-col items-center justify-center cursor-pointer p-2 text-center group",
                  isUploading && "opacity-60 pointer-events-none",
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-5 text-brand-pink animate-spin mb-1" />
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Uploading...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="size-5 text-muted-foreground group-hover:text-brand-pink transition-colors mb-1" />
                    <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">
                      Upload Image
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploading}
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    setIsUploading(true);
                    const toastId = toast.loading(
                      `Uploading ${files.length} image${files.length > 1 ? "s" : ""} to Supabase...`,
                    );
                    try {
                      const uploadedUrls: string[] = [];
                      for (const file of files) {
                        const url = await uploadImageToSupabase(file, "products");
                        uploadedUrls.push(url);
                      }
                      setF((prev) => ({
                        ...prev,
                        images: prev.images.filter(Boolean).concat(uploadedUrls),
                      }));
                      toast.dismiss(toastId);
                      toast.success("Images uploaded successfully");
                    } catch (err: any) {
                      toast.dismiss(toastId);
                      toast.error(err?.message || "Failed to upload image");
                    } finally {
                      setIsUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex gap-2">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="fld flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  if (urlInput.trim()) {
                    upd("images", f.images.filter(Boolean).concat(urlInput.trim()));
                    setUrlInput("");
                  }
                }}
                className="h-10 px-4 rounded-xl border border-border bg-white text-xs font-semibold hover:bg-secondary transition-colors shrink-0 cursor-pointer"
              >
                Add URL
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                Attributes{" "}
                <span className="text-[10px] text-muted-foreground/70 normal-case font-normal">
                  (Optional)
                </span>
              </label>
              {(f.attributes?.length ?? 0) < 3 && (
                <button
                  onClick={() =>
                    upd("attributes", [...(f.attributes || []), { name: "", values: [] }])
                  }
                  className="text-xs font-semibold text-brand-pink hover:underline cursor-pointer"
                >
                  + Add Attribute
                </button>
              )}
            </div>
            <div className="space-y-4">
              {f.attributes?.map((attr, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      placeholder="Name (e.g. Size, Color)"
                      value={attr.name}
                      onChange={(e) => {
                        const newAttrs = [...(f.attributes || [])];
                        newAttrs[idx].name = e.target.value;
                        upd("attributes", newAttrs);
                      }}
                      className="fld"
                    />
                    <input
                      placeholder="Values (comma-separated, e.g. Black, Brown, Beige)"
                      value={attrRawValues[idx] ?? attr.values.join(", ")}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAttrRawValues((prev) => ({ ...prev, [idx]: val }));
                        const newAttrs = [...(f.attributes || [])];
                        newAttrs[idx].values = val
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        upd("attributes", newAttrs);
                      }}
                      className="fld"
                    />
                  </div>
                  <button
                    onClick={() => {
                      upd(
                        "attributes",
                        (f.attributes || []).filter((_, i) => i !== idx),
                      );
                      setAttrRawValues((prev) => {
                        const copy = { ...prev };
                        delete copy[idx];
                        return copy;
                      });
                    }}
                    className="mt-1 p-2 text-red-500 hover:bg-red-50 rounded-md cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            {f.attributes && f.attributes.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                    Variants & Stock{" "}
                    <span className="text-[10px] text-muted-foreground/70 normal-case font-normal">
                      (Optional)
                    </span>
                  </label>
                  <button
                    onClick={() => {
                      let combinations: Record<string, string>[] = [{}];
                      f.attributes!.forEach((attr) => {
                        if (attr.values.length === 0) return;
                        const newCombos: Record<string, string>[] = [];
                        combinations.forEach((combo) => {
                          attr.values.forEach((val) => {
                            newCombos.push({ ...combo, [attr.name]: val });
                          });
                        });
                        combinations = newCombos;
                      });
                      const newVariants = combinations.map((combo) => {
                        const existing = f.variants?.find((v) =>
                          Object.entries(combo).every(([k, val]) => v.options[k] === val),
                        );
                        return (
                          existing || {
                            id: "v-" + Math.random().toString(36).substring(2, 8),
                            options: combo,
                            stock: 0,
                          }
                        );
                      });
                      upd("variants", newVariants);
                    }}
                    className="text-xs font-semibold text-brand-pink hover:underline cursor-pointer"
                  >
                    Generate Variants
                  </button>
                </div>

                {f.variants && f.variants.length > 0 && (
                  <div className="border border-border rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-surface border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">Variant</th>
                          <th className="px-4 py-2.5 font-medium w-28">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {f.variants.map((v, i) => (
                          <tr key={v.id}>
                            <td className="px-4 py-2.5">
                              {Object.entries(v.options).map(([k, val]) => (
                                <span
                                  key={k}
                                  className="mr-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-secondary text-foreground"
                                >
                                  {val}
                                </span>
                              ))}
                            </td>
                            <td className="px-4 py-2.5">
                              <input
                                type="number"
                                min="0"
                                value={v.stock === 0 ? "" : v.stock}
                                onChange={(e) => {
                                  const newVars = [...f.variants!];
                                  newVars[i].stock =
                                    e.target.value === ""
                                      ? 0
                                      : Math.max(0, parseInt(e.target.value, 10) || 0);
                                  upd("variants", newVars);
                                  upd(
                                    "stock",
                                    newVars.reduce((acc, cv) => acc + cv.stock, 0),
                                  );
                                }}
                                placeholder="0"
                                className="w-full h-8 rounded-lg border border-border px-2 text-xs font-medium"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="p-4 sm:p-5 border-t border-border flex items-center justify-end gap-2.5 shrink-0 bg-white sticky bottom-0 z-20">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!f.name || !f.name.trim()) {
                toast.error("Product name is required");
                return;
              }
              if (!f.description || !f.description.trim()) {
                toast.error("Description is required");
                return;
              }
              if (!f.category) {
                toast.error("Category is required");
                return;
              }
              if (!f.costPrice || f.costPrice <= 0) {
                toast.error("Cost price is required and must be greater than 0");
                return;
              }
              if (Number(basePriceInput) <= 0 && f.price <= 0) {
                toast.error("Selling price is required and must be greater than 0");
                return;
              }
              if (f.stock <= 0 && (!f.variants || f.variants.length === 0)) {
                toast.error("Stock quantity is required");
                return;
              }
              if (f.images.filter(Boolean).length === 0) {
                toast.error("At least one product image is required");
                return;
              }
              if (f.weight === undefined || f.weight === null || Number(f.weight) <= 0) {
                toast.error("Product weight (kg) is required and must be greater than 0");
                return;
              }
              onSave(f);
            }}
            className="h-10 px-5 rounded-xl bg-brand-pink text-ink text-sm font-semibold hover:bg-ink hover:text-white transition-colors shadow-sm cursor-pointer"
          >
            Save Product
          </button>
        </footer>
      </div>
      <style>{`.fld{width:100%;height:40px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:#fff;font-size:14px}textarea.fld{height:auto;padding:10px}`}</style>
    </div>
  );
}

function Row({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5 mb-1.5">
        {label}
        {required && <span className="text-rose-500 font-bold text-sm">*</span>}
        {optional && (
          <span className="text-[10px] text-muted-foreground/70 normal-case font-normal">
            (Optional)
          </span>
        )}
      </label>
      <div>{children}</div>
    </div>
  );
}
