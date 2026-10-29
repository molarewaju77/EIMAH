import { createFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductCardSkeleton } from "@/components/site/ProductCardSkeleton";
import { BrandOverlayLoader } from "@/components/site/BrandOverlayLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePaginatedProductsQuery } from "@/hooks/queries/useProductsQuery";
import { useCategoriesQuery } from "@/hooks/queries/useCategoriesQuery";

type ShopSearch = {
  cat?: string;
  category?: string;
  sort?: string;
  inStock?: boolean;
  max?: number;
  page?: number;
};

export const Route = createFileRoute("/shop")({
  component: ShopPage,
  validateSearch: (s: Record<string, unknown>): ShopSearch => {
    const activeCat = typeof s.cat === "string" ? s.cat : typeof s.category === "string" ? s.category : undefined;
    const inStock = s.inStock === true || s.inStock === "true" || s.in_stock === true || s.in_stock === "true";
    const rawPage = s.page;
    const parsedPage =
      typeof rawPage === "number"
        ? rawPage
        : typeof rawPage === "string"
          ? parseInt(rawPage, 10)
          : undefined;
    const validPage = parsedPage && !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : undefined;

    return {
      cat: activeCat,
      category: activeCat,
      sort: typeof s.sort === "string" ? s.sort : undefined,
      inStock: inStock ? true : undefined,
      max: typeof s.max === "number" ? s.max : undefined,
      page: validPage,
    };
  },
  head: () => ({
    meta: [
      { title: "Shop — EIMAH" },
      { name: "description", content: "Browse curated clothing, shoes, bags, home essentials and more from EIMAH." },
      { property: "og:title", content: "Shop — EIMAH" },
      { property: "og:description", content: "Curated products across clothing, shoes, bags and more." },
    ],
  }),
});

const PER_PAGE = 12;

function getPaginationRange(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // When near the start (Page 1 or 2): show [1, 2, 3, "ellipsis", totalPages]
  if (currentPage <= 2) {
    return [1, 2, 3, "ellipsis", totalPages];
  }

  // When near the end (last 2 pages): show ["ellipsis", totalPages - 2, totalPages - 1, totalPages]
  if (currentPage >= totalPages - 1) {
    return ["ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }

  // When 2 pages away from the end (e.g. Page 7 of 9): show ["ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  if (currentPage === totalPages - 2) {
    return ["ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // In the middle (Pages 3, 4, 5, etc.): Page 1 tucks into the left ellipsis
  // e.g. on Page 3: ["ellipsis", 2, 3, 4, "ellipsis", totalPages]
  // e.g. on Page 4: ["ellipsis", 3, 4, 5, "ellipsis", totalPages]
  return ["ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function ShopPage() {
  const search = useSearch({ from: "/shop" });
  const activeCat = search.category || search.cat;
  return (
    <ShopInner
      initialCat={activeCat}
      initialSort={search.sort}
      initialInStock={Boolean(search.inStock)}
      initialPage={search.page || 1}
    />
  );
}

export function ShopInner({
  initialCat,
  initialSort,
  initialInStock = false,
  initialPage = 1,
}: {
  initialCat?: string;
  initialSort?: string;
  initialInStock?: boolean;
  initialPage?: number;
}) {
  const nav = useNavigate();
  const [cat, setCat] = useState<string | undefined>(initialCat);
  const [sort, setSort] = useState<string>(initialSort || "featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [inStock, setInStock] = useState(initialInStock);
  const [page, setPage] = useState(initialPage);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  // Debounce search query to keep typing responsive without server spam
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 280);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync page state whenever URL query param changes (e.g. browser back/forward or reload)
  useEffect(() => {
    if (initialPage && initialPage !== page) {
      setPage(initialPage);
    }
  }, [initialPage]);

  // Sync category filter whenever URL query param changes
  useEffect(() => {
    setCat(initialCat);
  }, [initialCat]);

  // Sync inStock filter whenever URL query param changes
  useEffect(() => {
    setInStock(Boolean(initialInStock));
  }, [initialInStock]);

  // Sync sort filter whenever URL query param changes
  useEffect(() => {
    if (initialSort) {
      setSort(initialSort);
    }
  }, [initialSort]);

  // Live Categories from Supabase
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategoriesQuery();
  const activeCategories = categories.filter((c) => c.active !== false);

  // Live Products from Supabase with full server-side pagination & filtering
  const {
    data: productsData,
    isLoading,
    isFetching,
  } = usePaginatedProductsQuery({
    page,
    pageSize: PER_PAGE,
    category: cat || undefined,
    search: debouncedSearch.trim() || undefined,
    status: "Active",
    inStock: inStock ? true : undefined,
    sort,
  });

  const products = productsData?.products || [];
  const totalCount = productsData?.totalCount || 0;
  const totalPages = productsData?.totalPages || 1;

  const paginationRange = useMemo(() => {
    return getPaginationRange(page, totalPages);
  }, [page, totalPages]);

  const isSearching =
    searchQuery.trim() !== debouncedSearch.trim() ||
    (isFetching && Boolean(debouncedSearch.trim()));

  const isFiltering = isTabSwitching || isSearching || isFetching;

  const handleCategoryChange = (newCat?: string) => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setIsTabSwitching(true);
    setCat(newCat);
    setPage(1);
    setSheetOpen(false);
    nav({
      to: "/shop",
      search: (prev: any) => ({
        ...prev,
        category: newCat || undefined,
        cat: undefined,
        page: undefined,
      }),
    });
    setTimeout(() => {
      setIsTabSwitching(false);
    }, 450);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
    // When searching, switch category to "All products" automatically
    if (val.trim() && cat) {
      setCat(undefined);
      nav({
        to: "/shop",
        search: (prev: any) => ({ ...prev, category: undefined, cat: undefined, page: undefined }),
      });
    }
  };

  const handleStockChange = (checked: boolean) => {
    setIsTabSwitching(true);
    setInStock(checked);
    setPage(1);
    nav({
      to: "/shop",
      search: (prev: any) => ({
        ...prev,
        inStock: checked ? true : undefined,
        page: undefined,
      }),
    });
    setTimeout(() => {
      setIsTabSwitching(false);
    }, 450);
  };

  const handleSortChange = (val: string) => {
    setIsTabSwitching(true);
    setSort(val);
    setPage(1);
    nav({
      to: "/shop",
      search: (prev: any) => ({
        ...prev,
        sort: val !== "featured" ? val : undefined,
        page: undefined,
      }),
    });
    setTimeout(() => {
      setIsTabSwitching(false);
    }, 450);
  };

  const handleResetFilters = () => {
    setIsTabSwitching(true);
    setCat(undefined);
    setSearchQuery("");
    setDebouncedSearch("");
    setInStock(false);
    setSort("featured");
    setPage(1);
    nav({
      to: "/shop",
      search: () => ({}),
    });
    setTimeout(() => {
      setIsTabSwitching(false);
    }, 450);
  };

  const handlePageChange = (newPage: number) => {
    if (isFiltering || isLoading) return;
    setPage(newPage);
    nav({
      to: "/shop",
      search: (prev: any) => ({
        ...prev,
        page: newPage > 1 ? newPage : undefined,
      }),
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const Filters = (
    <div className="space-y-8">
      <div>
        <h4 className="font-display font-semibold text-sm mb-3">Category</h4>
        <ul className="space-y-1.5 text-sm">
          <li>
            <button
              onClick={() => handleCategoryChange(undefined)}
              className={cn(
                "flex items-center justify-between text-left w-full transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg",
                !cat
                  ? "font-semibold text-brand-pink bg-brand-pink/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <span>All products</span>
              {!cat && <span className="text-brand-pink font-bold text-xs select-none">»</span>}
            </button>
          </li>
          {isCategoriesLoading && activeCategories.length === 0 ? (
            <div className="space-y-2 py-1 px-2.5">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ) : (
            activeCategories.map((c) => (
              <li key={c.slug}>
                <button
                  onClick={() => handleCategoryChange(c.slug)}
                  className={cn(
                    "flex items-center justify-between text-left w-full transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg",
                    cat === c.slug
                      ? "font-semibold text-brand-pink bg-brand-pink/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  <span>{c.name}</span>
                  {cat === c.slug && <span className="text-brand-pink font-bold text-xs select-none">»</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => handleStockChange(e.target.checked)}
            className="accent-[#F590DD] cursor-pointer"
          />
          In stock only
        </label>
      </div>
    </div>
  );

  return (
    <SiteLayout>
      <div className="container-eimah pt-12 pb-14 md:pt-10 md:pb-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
              {cat ? activeCategories.find((c) => c.slug === cat)?.name || cat : "All products"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial md:min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-9 pr-9 rounded-xl border border-border bg-background focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden inline-flex items-center gap-2 border border-border rounded-xl px-3 h-10 text-sm hover:bg-surface transition-colors cursor-pointer">
                  <SlidersHorizontal className="size-4" /> Filters
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl px-6 pb-6 pt-5">
                <SheetHeader className="text-left pb-3 border-b border-border/40">
                  <SheetTitle className="font-display text-base">Filters</SheetTitle>
                </SheetHeader>
                <div className="pt-4 overflow-y-auto max-h-[calc(85vh-90px)]">{Filters}</div>
              </SheetContent>
            </Sheet>

            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-border rounded-xl h-10 px-3 text-sm bg-background hidden sm:block cursor-pointer outline-none focus:border-ink"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start w-full min-w-0">
          <aside className="hidden md:block md:col-span-4 lg:col-span-3 border border-border/60 bg-white rounded-2xl p-6 shadow-sm sticky top-24">
            {Filters}
          </aside>
          <div className={cn("md:col-span-8 lg:col-span-9 relative w-full min-w-0", (isFiltering || (isLoading && !productsData) || products.length === 0) && "min-h-[220px] md:min-h-[260px]")}>
            {isFiltering || (isLoading && !productsData) ? (
              <div className="py-8 md:py-12 flex items-center justify-center">
                <BrandOverlayLoader show mode="block" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-surface/30 rounded-2xl border border-dashed border-border/60">
                <p className="text-base font-medium text-foreground">
                  {debouncedSearch.trim() ? `No products match "${debouncedSearch.trim()}"` : "No products match your filters"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {debouncedSearch.trim() ? "Try checking for typos or searching with different keywords." : "Try clearing some filters or searching for something else."}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-3.5 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full min-w-0">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p as any} />
                ))}
              </div>
            )}

            {!isFiltering && !(isLoading && !productsData) && totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-1.5 sm:gap-2 select-none">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  aria-label="Previous page"
                  className="h-9 px-3 rounded-lg text-sm border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium"
                >
                  Prev
                </button>
                {paginationRange.map((item, idx) => {
                  if (item === "ellipsis") {
                    const isLeft = idx === 0;
                    const jumpTarget = isLeft ? Math.max(1, page - 2) : Math.min(totalPages, page + 2);
                    return (
                      <button
                        key={`ellipsis-${idx}`}
                        type="button"
                        onClick={() => handlePageChange(jumpTarget)}
                        title={isLeft ? "Jump 2 pages back" : "Jump 2 pages forward"}
                        aria-label={isLeft ? "Jump back" : "Jump forward"}
                        className="h-9 min-w-7 sm:min-w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm tracking-widest font-medium select-none"
                      >
                        …
                      </button>
                    );
                  }

                  const isCurrent = page === item;
                  return (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item)}
                      aria-label={`Page ${item}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={cn(
                        "h-9 min-w-8 sm:min-w-9 px-2 sm:px-3 rounded-lg text-sm border cursor-pointer font-medium transition-colors",
                        isCurrent
                          ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                          : "border-border hover:bg-secondary transition-colors text-foreground"
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  aria-label="Next page"
                  className="h-9 px-3 rounded-lg text-sm border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
