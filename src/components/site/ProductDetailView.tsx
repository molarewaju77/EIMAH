import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Minus, Plus, ShoppingBag, Truck, ShieldCheck, ArrowRight, Package, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { BrandOverlayLoader } from "@/components/site/BrandOverlayLoader";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import { useProductDetailQuery, useProductsQuery } from "@/hooks/queries/useProductsQuery";
import { RestockNoticeModal } from "@/components/site/RestockNoticeModal";
import { verifySingleItemStock } from "@/lib/db/stock-check";

export function ProductDetailView({ productId }: { productId: string }) {
  const { data: p, isLoading, isError } = useProductDetailQuery(productId);
  const { data: allProducts = [] } = useProductsQuery();

  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [liveAvailableStock, setLiveAvailableStock] = useState<number | null>(null);

  const add = useCart((s) => s.add);
  const cartItems = useCart((s) => s.items);
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const mainImageRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to top and reset active image index on product change
  useEffect(() => {
    setActive(0);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [productId]);

  // Initialize selected options once product is loaded
  useEffect(() => {
    if (p?.attributes && p.attributes.length > 0) {
      const initial: Record<string, string> = {};
      p.attributes.forEach((a) => {
        initial[a.name] = a.values[0];
      });
      setSelectedOptions(initial);
    }
  }, [p?.id]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-eimah py-32 flex flex-col items-center justify-center min-h-[60vh]">
          <BrandOverlayLoader show mode="block" />
        </div>
      </SiteLayout>
    );
  }

  if (isError || !p) {
    return (
      <SiteLayout>
        <div className="container-eimah py-28 text-center max-w-md mx-auto space-y-4">
          <h2 className="font-display font-bold text-3xl">Product Not Found</h2>
          <p className="text-muted-foreground text-sm">
            The product you are looking for does not exist or may have been removed.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Return to Shop <ArrowRight className="size-4" />
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const related = allProducts
    .filter((x) => x.category === p.category && x.id !== p.id && x.status === "Active")
    .slice(0, 4);

  const images = p.images && p.images.length > 0 ? p.images : ["https://placehold.co/600x800?text=No+Image"];

  const handleThumbnailClick = (index: number) => {
    setActive(index);
    if (mainImageRef.current) {
      const width = mainImageRef.current.clientWidth;
      mainImageRef.current.scrollTo({ left: index * width, behavior: "smooth" });
    }
  };

  const isOutOfStock =
    p.variants && p.variants.length > 0
      ? p.variants.every((v) => Number(v.stock ?? 0) <= 0)
      : Number(p.stock ?? 0) <= 0;

  const selectedVariant = p.variants?.find((v) =>
    Object.entries(selectedOptions).every(([k, val]) => v.options[k] === val)
  );

  const availableStock =
    p.variants && p.variants.length > 0
      ? Number(selectedVariant?.stock ?? 0)
      : Number(p.stock ?? 0);

  const cartItemId = `${p.id}-${selectedOptions && Object.keys(selectedOptions).length > 0 ? Object.entries(selectedOptions).sort().map(([k, v]) => `${k}:${v}`).join("|") : "base"}`;
  const existingCartQty = cartItems.find((i) => i.cartItemId === cartItemId)?.qty ?? 0;

  const isSelectedVariantOut =
    p.variants && p.variants.length > 0
      ? !selectedVariant || Number(selectedVariant.stock ?? 0) <= 0
      : Number(p.stock ?? 0) <= 0;

  const variantSummary = selectedVariant
    ? Object.entries(selectedVariant.options)
        .map(([k, val]) => `${k}: ${val}`)
        .join(" · ")
    : null;

  const currentAvailableStock =
    liveAvailableStock !== null ? liveAvailableStock : availableStock;

  const handleAction = async (buyNow: boolean = false) => {
    if (isCheckingStock) return;
    setIsBuyNow(buyNow);

    // 1. If entire product is out of stock across all variants, show restock notice
    if (isOutOfStock) {
      setOpen(false);
      setTimeout(() => {
        setRestockModalOpen(true);
      }, 150);
      return;
    }

    // 2. If product has attributes and options modal isn't open yet, open it so user can pick options/qty
    if (p.attributes && p.attributes.length > 0 && !open) {
      setOpen(true);
      return;
    }

    setIsCheckingStock(true);
    try {
      // 3. Live API stock verification against live Supabase data
      const stockRes = await verifySingleItemStock(
        p.id,
        qty,
        selectedOptions,
        selectedVariant?.id
      );

      const verifiedStock = stockRes.availableStock;
      setLiveAvailableStock(verifiedStock);

      if (!stockRes.isValid || verifiedStock <= 0 || qty > verifiedStock) {
        setOpen(false);
        setTimeout(() => {
          setRestockModalOpen(true);
        }, 150);
        return;
      }

      // 4. Handle "Buy Now" flow (bypasses the regular shopping bag completely):
      if (buyNow) {
        const variantKey = selectedOptions && Object.keys(selectedOptions).length > 0
          ? Object.entries(selectedOptions).sort().map(([k, v]) => `${k}:${v}`).join("|")
          : "base";
        const buyNowDirectItem = {
          cartItemId: `buy-now-${p.id}-${variantKey}`,
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: images[0],
          qty: qty,
          weight: p.weight !== undefined && p.weight !== null ? Number(p.weight) : undefined,
          selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
          maxStock: verifiedStock,
        };

        try {
          sessionStorage.setItem("eimah_buy_now_item", JSON.stringify(buyNowDirectItem));
          localStorage.setItem("eimah_buy_now_item", JSON.stringify(buyNowDirectItem));
        } catch (err) {
          console.warn("[ProductDetail] Storage write failed:", err);
        }

        setOpen(false);
        nav({ to: "/checkout", search: { buyNow: true } });
        return;
      }

      // 5. Handle regular "Add to Cart" flow:
      if (p.attributes && p.attributes.length > 0) {
        // @ts-ignore
        add(p, qty, selectedOptions);
      } else {
        add(p as any, qty);
      }

      setOpen(false);
      toast.success(`Added ${qty > 1 ? `${qty}x ` : ""}${p.name} to cart`);
    } catch (err) {
      console.error("Live stock check failed in ProductDetailView:", err);
      // Fallback
      if (isSelectedVariantOut || availableStock <= 0 || qty > availableStock) {
        setOpen(false);
        setTimeout(() => {
          setRestockModalOpen(true);
        }, 150);
        return;
      }

      if (buyNow) {
        const variantKey = selectedOptions && Object.keys(selectedOptions).length > 0
          ? Object.entries(selectedOptions).sort().map(([k, v]) => `${k}:${v}`).join("|")
          : "base";
        const buyNowDirectItem = {
          cartItemId: `buy-now-${p.id}-${variantKey}`,
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: images[0],
          qty: qty,
          weight: p.weight !== undefined && p.weight !== null ? Number(p.weight) : undefined,
          selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
          maxStock: availableStock,
        };

        try {
          sessionStorage.setItem("eimah_buy_now_item", JSON.stringify(buyNowDirectItem));
          localStorage.setItem("eimah_buy_now_item", JSON.stringify(buyNowDirectItem));
        } catch (storageErr) {
          console.warn("[ProductDetail] Storage write failed:", storageErr);
        }

        setOpen(false);
        nav({ to: "/checkout", search: { buyNow: true } });
        return;
      }

      if (p.attributes && p.attributes.length > 0) {
        // @ts-ignore
        add(p, qty, selectedOptions);
      } else {
        add(p as any, qty);
      }

      setOpen(false);
      toast.success(`Added ${qty > 1 ? `${qty}x ` : ""}${p.name} to cart`);
    } finally {
      setIsCheckingStock(false);
    }
  };

  const OptionsSelector = () => (
    <div className="py-4 space-y-6">
      {p.variants && p.variants.length > 0 && selectedVariant && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              Number(selectedVariant.stock ?? 0) <= 0
                ? "bg-red-100 text-red-700"
                : Number(selectedVariant.stock ?? 0) <= 5
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800",
            )}
          >
            {Number(selectedVariant.stock ?? 0) <= 0
              ? "Out of Stock"
              : `${selectedVariant.stock} available`}
          </span>
        </div>
      )}
      {p.attributes?.map((attr) => (
        <div key={attr.name}>
          <p className="text-sm font-semibold mb-2">{attr.name}</p>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((v) => (
              <button
                key={v}
                onClick={() => setSelectedOptions((s) => ({ ...s, [attr.name]: v }))}
                className={cn(
                  "px-4 h-10 rounded-full border text-sm transition-colors cursor-pointer",
                  selectedOptions[attr.name] === v
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground bg-background text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantity Selector inside popup */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div>
          <p className="text-sm font-semibold text-foreground">Quantity</p>
          <p className="text-xs text-muted-foreground">Select amount to add</p>
        </div>
        <div className="inline-flex items-center border border-border rounded-full bg-surface/50">
          <button
            type="button"
            disabled={isCheckingStock}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-10 w-10 grid place-items-center hover:bg-secondary rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="size-4 text-foreground" />
          </button>
          <span className="w-10 text-center font-semibold text-sm select-none text-foreground">{qty}</span>
          <button
            type="button"
            disabled={isCheckingStock}
            onClick={() => setQty((q) => q + 1)}
            className="h-10 w-10 grid place-items-center hover:bg-secondary rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="size-4 text-foreground" />
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled={isCheckingStock}
        onClick={() => handleAction(isBuyNow)}
        className="w-full mt-4 font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm bg-brand-pink text-ink hover:bg-ink hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCheckingStock ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <>
            <ShoppingBag className="size-4" /> {isBuyNow ? "Buy now" : "Add to cart"}
          </>
        )}
      </button>
    </div>
  );

  return (
    <SiteLayout>
      <div className="container-eimah pt-12 pb-8 md:pt-10 md:pb-12">
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap font-display tracking-tight">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Home</Link>
          <span className="text-brand-pink font-bold text-xs select-none">»</span>
          <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Shop</Link>
          <span className="text-brand-pink font-bold text-xs select-none">»</span>
          <Link
            to="/shop"
            search={{ category: p.category }}
            className="capitalize text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            {p.category.replace(/-/g, " ")}
          </Link>
          <span className="text-brand-pink font-bold text-xs select-none">»</span>
          <span className="text-foreground font-semibold truncate max-w-[140px] sm:max-w-[260px] md:max-w-md block" title={p.name}>
            {p.name}
          </span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images Gallery */}
          <div className="min-w-0">
            <div
              ref={mainImageRef}
              className="aspect-[4/5] rounded-2xl overflow-hidden bg-surface-2 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide border border-border/50"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                if (width > 0) {
                  const index = Math.round(scrollLeft / width);
                  if (index !== active) {
                    setActive(index);
                  }
                }
              }}
            >
              {images.map((img, i) => (
                <div key={i} className="w-full h-full flex-none snap-start relative">
                  <img src={img} alt={p.name} className="h-full w-full object-cover absolute inset-0" />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto snap-x pb-2 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => handleThumbnailClick(i)}
                    className={cn(
                      "relative flex-none w-14 md:w-20 aspect-[4/5] rounded-xl overflow-hidden bg-surface-2 border snap-start transition-all cursor-pointer",
                      active === i ? "border-foreground ring-2 ring-foreground/20" : "border-border opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Actions */}
          <div className="md:sticky md:top-24 md:self-start space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground capitalize font-semibold">
                {p.category.replace(/-/g, " ")}
              </p>
              <h1 className="mt-2 font-display font-bold text-3xl md:text-5xl tracking-tight text-balance">
                {p.name}
              </h1>
              <div className="mt-4 flex items-baseline gap-3 flex-wrap">
                <span className="font-display font-bold text-2xl md:text-3xl text-foreground">
                  {formatNaira(p.price)}
                </span>
                {p.compareAt && p.compareAt > p.price && (
                  <>
                    <span className="text-muted-foreground line-through text-base">
                      {formatNaira(p.compareAt)}
                    </span>
                    <span className="text-xs font-semibold bg-brand-lime text-ink rounded-full px-2.5 py-0.5">
                      Save {Math.round(((p.compareAt - p.price) / p.compareAt) * 100)}%
                    </span>
                  </>
                )}
                {isOutOfStock && (
                  <span className="text-xs font-semibold bg-neutral-900 text-white rounded-full px-2.5 py-1 uppercase tracking-wide">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {p.description && (
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-line">
                {p.description}
              </p>
            )}

            <div ref={actionsRef} className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "inline-flex items-center border border-border rounded-full bg-surface/50",
                    (isOutOfStock || isCheckingStock) && "opacity-50 pointer-events-none",
                  )}
                >
                  <button
                    disabled={isOutOfStock || isCheckingStock}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-12 w-12 grid place-items-center hover:bg-secondary rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-sm">{qty}</span>
                  <button
                    disabled={isOutOfStock || isCheckingStock}
                    onClick={() => setQty((q) => q + 1)}
                    className="h-12 w-12 grid place-items-center hover:bg-secondary rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={isOutOfStock || isCheckingStock}
                  onClick={() => {
                    setIsBuyNow(false);
                    handleAction(false);
                  }}
                  className="flex-1 h-12 rounded-full font-display font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-sm bg-brand-pink text-ink hover:bg-ink hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingStock && !isBuyNow ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag className="size-4" /> Add to cart
                    </>
                  )}
                </button>
              </div>
              {!isOutOfStock && (
                <button
                  type="button"
                  disabled={isCheckingStock}
                  onClick={() => {
                    setIsBuyNow(true);
                    handleAction(true);
                  }}
                  className="w-full h-12 rounded-full bg-foreground text-background font-display font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCheckingStock && isBuyNow ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    "Buy now"
                  )}
                </button>
              )}
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="font-semibold text-base mb-6">Product Highlights</h3>
              <div className="space-y-5 text-sm">
                <div className="flex gap-4">
                  <ShieldCheck className="size-5 shrink-0 text-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">Quality Checked</p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed text-xs sm:text-sm">
                      Every product is carefully inspected before it is made available for purchase.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Package className="size-5 shrink-0 text-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">Secure Packaging</p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed text-xs sm:text-sm">
                      Your order is carefully packed to help ensure it arrives in excellent condition.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Truck className="size-5 shrink-0 text-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">Reliable Delivery</p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed text-xs sm:text-sm">
                      Shipped nationwide with trusted delivery partners or available for pickup.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4 text-sm">
              <details className="group">
                <summary className="flex justify-between cursor-pointer font-semibold list-none">
                  Delivery & Returns
                  <ArrowRight className="size-4 transition-transform group-open:rotate-90 text-muted-foreground" />
                </summary>
                <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
                  Lagos deliveries in 24–48 hours; nationwide delivery in 3–5 business days. Unused items may be returned within 7 days for a full refund or exchange.
                </p>
              </details>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24 border-t border-border pt-16">
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-8">You may also like</h2>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              {related.map((r) => (
                <ProductCard key={r.id} product={r as any} />
              ))}
            </div>
          </section>
        )}
        <div ref={bottomRef} className="h-px w-full" />
      </div>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="px-6 pb-6">
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle>Select Options</DrawerTitle>
            </DrawerHeader>
            <OptionsSelector />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select Options</DialogTitle>
            </DialogHeader>
            <OptionsSelector />
          </DialogContent>
        </Dialog>
      )}

      {/* Synchronized Restock Notice Modal for Mobile and Desktop */}
      <RestockNoticeModal
        open={restockModalOpen}
        onOpenChange={setRestockModalOpen}
        product={p}
        variantSummary={variantSummary}
        demandedQuantity={qty}
        availableStock={currentAvailableStock}
        existingCartQty={existingCartQty}
        actionType={isBuyNow ? "buy_now" : "cart"}
        onAddToCartAvailable={(maxAddable) => {
          if (isBuyNow) {
            const variantKey = selectedOptions && Object.keys(selectedOptions).length > 0
              ? Object.entries(selectedOptions).sort().map(([k, v]) => `${k}:${v}`).join("|")
              : "base";
            const buyNowDirectItem = {
              cartItemId: `buy-now-${p.id}-${variantKey}`,
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price,
              image: images[0],
              qty: maxAddable,
              weight: p.weight !== undefined && p.weight !== null ? Number(p.weight) : undefined,
              selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
              maxStock: availableStock,
            };

            try {
              sessionStorage.setItem("eimah_buy_now_item", JSON.stringify(buyNowDirectItem));
              localStorage.setItem("eimah_buy_now_item", JSON.stringify(buyNowDirectItem));
            } catch (err) {
              console.warn("[ProductDetail] Storage write failed:", err);
            }

            setRestockModalOpen(false);
            nav({ to: "/checkout", search: { buyNow: true } });
          } else {
            if (p.attributes && p.attributes.length > 0) {
              // @ts-ignore
              add(p, maxAddable, selectedOptions);
            } else {
              add(p as any, maxAddable);
            }
            toast.success(`Added available ${maxAddable > 1 ? `${maxAddable}x ` : ""}${p.name} to cart`);
            setRestockModalOpen(false);
          }
        }}
        onBackToOptions={() => {
          setRestockModalOpen(false);
          if (p.attributes && p.attributes.length > 0) {
            setTimeout(() => setOpen(true), 150);
          } else {
            if (availableStock > 0) {
              setQty(Math.min(qty, availableStock));
            }
          }
        }}
      />
    </SiteLayout>
  );
}
