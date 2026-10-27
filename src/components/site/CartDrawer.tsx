import { Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCart } from "@/lib/cart-store";
import { useCartDrawer } from "@/lib/cart-drawer-store";
import { formatNaira } from "@/lib/mock-data";
import { verifyItemsStock, type StockConflict } from "@/lib/db/stock-check";
import { CartStockNoticeModal } from "@/components/site/CartStockNoticeModal";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const open = useCartDrawer((s) => s.open);
  const close = useCartDrawer((s) => s.close);
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const updateItemStockLimits = useCart((s) => s.updateItemStockLimits);
  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);

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

      close();
      nav({ to: "/checkout" });
    } catch (err) {
      console.error("[CartDrawer] Checkout stock check error:", err);
      close();
      nav({ to: "/checkout" });
    } finally {
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        aria-label="Close cart"
        onClick={close}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <aside
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-label="Shopping cart"
      >
        <header className="flex items-center justify-between px-6 h-16 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4" />
            <h2 className="font-display font-semibold text-lg">
              Your Bag <span className="text-muted-foreground font-normal text-sm">· {items.reduce((n, i) => n + i.qty, 0)}</span>
            </h2>
          </div>
          <button onClick={close} className="p-2 -mr-2 rounded-md hover:bg-secondary" aria-label="Close">
            <X className="size-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
            <div className="grid place-items-center h-16 w-16 rounded-full bg-surface-2 mb-5">
              <ShoppingBag className="size-6" />
            </div>
            <p className="font-display font-semibold text-lg">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Curated pieces await. Start with something you love.
            </p>
            <Link
              to="/shop"
              onClick={close}
              className="mt-6 inline-flex items-center gap-2 bg-brand-pink text-ink font-display font-semibold px-5 py-2.5 rounded-full hover:bg-ink hover:text-white transition-colors"
            >
              Shop now <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 divide-y divide-border">
              {items.map((i) => (
                <div key={i.cartItemId} className="py-5 flex gap-4">
                  <Link
                    to="/product/$id"
                    params={{ id: i.slug }}
                    onClick={close}
                    className="h-24 w-20 shrink-0 rounded-md overflow-hidden bg-surface-2"
                  >
                    <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-3">
                      <Link
                        to="/product/$id"
                        params={{ id: i.slug }}
                        onClick={close}
                        className="min-w-0"
                      >
                        <p className="font-display font-semibold text-sm truncate">{i.name}</p>
                        {i.selectedOptions && Object.keys(i.selectedOptions).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {Object.entries(i.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">{formatNaira(i.price)}</p>
                      </Link>
                      <button
                        onClick={() => remove(i.cartItemId)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        aria-label="Remove"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center h-8 rounded-full border border-border">
                        <button
                          onClick={() => setQty(i.cartItemId, i.qty - 1)}
                          className="w-8 grid place-items-center hover:bg-secondary rounded-l-full transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{i.qty}</span>
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
                          className="w-8 grid place-items-center hover:bg-secondary rounded-r-full transition-colors cursor-pointer"
                          aria-label="Increase"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <p className="font-display font-semibold text-sm">{formatNaira(i.qty * i.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-border p-6 bg-surface">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display font-bold text-lg">{formatNaira(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/cart"
                  onClick={close}
                  className="h-11 rounded-full border border-foreground font-display font-semibold text-sm inline-flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                >
                  View Cart
                </Link>
                <button
                  type="button"
                  disabled={isCheckingOut}
                  onClick={handleProceedToCheckout}
                  className="h-11 rounded-full bg-brand-pink text-ink font-display font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-ink hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isCheckingOut ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Checkout <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>

      {/* Live Stock Conflict Notice Modal (Option B) */}
      <CartStockNoticeModal
        open={stockModalOpen}
        onOpenChange={setStockModalOpen}
        conflicts={stockConflicts}
      />
    </div>
  );
}
