import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, ShoppingBag, ArrowRight, Trash2, Check } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import type { StockConflict } from "@/lib/db/stock-check";

export interface CartStockNoticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: StockConflict[];
  onReviewCart?: () => void;
}

export function CartStockNoticeModal({
  open,
  onOpenChange,
  conflicts,
  onReviewCart,
}: CartStockNoticeModalProps) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  if (!conflicts || conflicts.length === 0) return null;

  const handleAdjustSingle = (conflict: StockConflict) => {
    if (!conflict.cartItemId) return;
    if (conflict.availableStock <= 0) {
      remove(conflict.cartItemId);
    } else {
      setQty(conflict.cartItemId, conflict.availableStock);
    }
  };

  const handleAdjustAllToAvailable = () => {
    for (const c of conflicts) {
      if (!c.cartItemId) continue;
      if (c.availableStock <= 0) {
        remove(c.cartItemId);
      } else {
        setQty(c.cartItemId, c.availableStock);
      }
    }
    onOpenChange(false);
  };

  const handleDismiss = () => {
    onOpenChange(false);
    if (onReviewCart) onReviewCart();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[460px] rounded-2xl p-5 sm:p-6 bg-background shadow-2xl border border-border/80 focus:outline-none max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Stock Update Required</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-5">
          {/* Header Icon + Notice */}
          <div className="text-center space-y-2.5">
            <div className="mx-auto size-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
              <AlertCircle className="size-6 stroke-[1.75]" />
            </div>

            <h3 className="font-display font-bold text-xl text-foreground tracking-tight">
              Stock Update Required
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Some items in your cart have sold out or have fewer pieces remaining. Please adjust your cart quantities before proceeding to checkout.
            </p>
          </div>

          {/* List of Affected Cart Items */}
          <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
            {conflicts.map((conflict, idx) => {
              const imgUrl = conflict.image || "https://placehold.co/600x800?text=Product";
              return (
                <div
                  key={conflict.cartItemId || conflict.productId + idx}
                  className="p-3 rounded-xl border border-border/70 bg-surface/50 flex items-center gap-3 transition-colors"
                >
                  <img
                    src={imgUrl}
                    alt={conflict.name}
                    className="size-14 rounded-lg object-cover shrink-0 border border-border/50"
                  />
                  <div className="min-w-0 flex-1 text-xs space-y-1">
                    <p className="font-semibold text-foreground truncate text-sm">
                      {conflict.name}
                    </p>
                    {conflict.variantSummary && (
                      <p className="text-muted-foreground truncate text-[11px]">
                        {conflict.variantSummary}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="text-muted-foreground font-medium">
                        In cart: <strong className="text-foreground">{conflict.requestedQty}</strong>
                      </span>
                      <span className="text-muted-foreground">·</span>
                      {conflict.isOutOfStock ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                          Out of stock
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
                          Only {conflict.availableStock} available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Button for this row */}
                  {conflict.cartItemId && (
                    <button
                      type="button"
                      onClick={() => handleAdjustSingle(conflict)}
                      className="shrink-0 p-2 text-xs rounded-lg border border-border hover:bg-secondary text-foreground font-medium transition-colors cursor-pointer flex items-center gap-1"
                      title={conflict.isOutOfStock ? "Remove from cart" : `Set to ${conflict.availableStock}`}
                    >
                      {conflict.isOutOfStock ? (
                        <>
                          <Trash2 className="size-3.5 text-rose-600" />
                          <span className="hidden sm:inline text-rose-600">Remove</span>
                        </>
                      ) : (
                        <>
                          <Check className="size-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Set {conflict.availableStock}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleAdjustAllToAvailable}
              className="w-full bg-brand-pink text-ink font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-ink hover:text-white transition-colors cursor-pointer shadow-sm text-sm"
            >
              Update All to Available
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-full border border-border text-foreground hover:bg-secondary font-medium text-xs transition-colors cursor-pointer block mx-auto text-center"
            >
              Review & Adjust Manually
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
