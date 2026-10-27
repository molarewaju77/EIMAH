import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart, useCartHydrated } from "@/lib/cart-store";
import { formatNaira } from "@/lib/mock-data";
import { verifyItemsStock, type StockConflict } from "@/lib/db/stock-check";
import { CartStockNoticeModal } from "@/components/site/CartStockNoticeModal";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Cart — EIMAH" },
      { name: "description", content: "Review your bag before checkout." },
    ],
  }),
});

function CartPage() {
  const isCartHydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const updateItemStockLimits = useCart((s) => s.updateItemStockLimits);
  const subtotal = useCart((s) => s.items.reduce((n, i) => n + i.qty * i.price, 0));
  const shipping = subtotal > 75000 || subtotal === 0 ? 0 : 3500;
  const total = subtotal + shipping;

  const nav = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [stockConflicts, setStockConflicts] = useState<StockConflict[]>([]);
  const [stockModalOpen, setStockModalOpen] = useState(false);

  const handleProceedToCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    try {
      const res = await verifyItemsStock(
        items.map((i) => ({
          cartItemId: i.cartItemId,
          productId: i.id,
          name: i.name,
          image: i.image,
          slug: i.slug,
          qty: i.qty,
          selectedOptions: i.selectedOptions,
        }))
      );

      // Update max stock ceiling for each item in store
      updateItemStockLimits(res.stockMap);

      if (!res.isValid) {
        setStockConflicts(res.conflicts);
        setStockModalOpen(true);
        return;
      }

      nav({ to: "/checkout" });
    } catch (err) {
      console.error("[Cart] Checkout stock check error:", err);
      nav({ to: "/checkout" });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isCartHydrated) {
    return (
      <SiteLayout>
        <div className="container-eimah pb-10 md:pb-16 animate-pulse">
          <div className="h-12 w-48 bg-border/40 rounded-lg mb-8" />
          <div className="h-64 bg-border/20 rounded-2xl border border-border" />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-eimah pb-10 md:pb-16">
        <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight">Your Bag</h1>
        <p className="mt-2 text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>

        {items.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center">
            <p className="font-display font-semibold text-xl">Your bag is empty.</p>
            <p className="mt-2 text-muted-foreground">Start with something you love.</p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-background font-display font-semibold px-6 py-3 rounded-full hover:bg-brand-pink hover:text-ink transition-colors"
            >
              Shop now <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 divide-y divide-border">
              {items.map((i) => (
                <div key={i.cartItemId} className="py-6 flex gap-4 md:gap-6">
                  <Link
                    to="/product/$id"
                    params={{ id: i.slug }}
                    className="h-28 w-24 md:h-32 md:w-28 shrink-0 rounded-md overflow-hidden bg-surface-2"
                  >
                    <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          to="/product/$id"
                          params={{ id: i.slug }}
                          className="font-display font-semibold truncate block"
                        >
                          {i.name}
                        </Link>
                        {i.selectedOptions && Object.keys(i.selectedOptions).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {Object.entries(i.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-0.5">{formatNaira(i.price)}</p>
                      </div>
                      <button
                        onClick={() => remove(i.cartItemId)}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                        aria-label="Remove"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-4">
                      <div className="inline-flex items-center border border-border rounded-full">
                        <button
                          onClick={() => setQty(i.cartItemId, i.qty - 1)}
                          className="h-9 w-9 grid place-items-center cursor-pointer hover:bg-secondary rounded-l-full transition-colors"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                        <button
                          onClick={() => {
                            if (i.maxStock !== undefined && i.qty + 1 > i.maxStock) {
                              toast.info(
                                i.maxStock <= 0
                                  ? "This item is currently out of stock."
                                  : `Only ${i.maxStock} available in stock.`
                              );
                              return;
                            }
                            setQty(i.cartItemId, i.qty + 1);
                          }}
                          className="h-9 w-9 grid place-items-center cursor-pointer hover:bg-secondary rounded-r-full transition-colors"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <p className="font-display font-semibold">{formatNaira(i.qty * i.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-2xl bg-surface p-6 md:p-8 h-fit lg:sticky lg:top-24">
              <h2 className="font-display font-semibold text-xl">Order summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold">{formatNaira(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="font-semibold text-muted-foreground text-xs">
                    Calculated at checkout
                  </dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt>Total</dt>
                  <dd className="font-display font-bold">{formatNaira(subtotal)}</dd>
                </div>
              </dl>
              <button
                type="button"
                disabled={isCheckingOut}
                onClick={handleProceedToCheckout}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-brand-pink text-ink font-display font-semibold h-12 rounded-full hover:bg-ink hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isCheckingOut ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    Checkout <ArrowRight className="size-4" />
                  </>
                )}
              </button>
              <p className="mt-4 text-xs text-muted-foreground">  
                Shipping rates calculated via Fez Delivery Express. See our{" "}
                <Link to="/delivery-policy" className="underline hover:text-foreground">
                  delivery
                </Link>{" "}
                and{" "}
                <Link to="/refund-policy" className="underline hover:text-foreground">
                  refund
                </Link>{" "}
                policies.
              </p>
            </aside>
          </div>
        )}
      </div>

      {/* Live Stock Conflict Notice Modal (Option B) */}
      <CartStockNoticeModal
        open={stockModalOpen}
        onOpenChange={setStockModalOpen}
        conflicts={stockConflicts}
      />
    </SiteLayout>
  );
}
