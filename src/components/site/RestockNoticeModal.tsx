import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingBag, Bell, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useCustomerAuth } from "@/lib/customer-store";
import { submitRestockRequest } from "@/lib/db/restock";
import { cn } from "@/lib/utils";

export interface RestockNoticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    slug: string;
    images?: string[];
    price?: number;
  };
  variantSummary?: string | null;
  demandedQuantity: number;
  availableStock: number;
  existingCartQty?: number;
  initialStep?: "oops" | "notify";
  actionType?: "cart" | "buy_now";
  onAddToCartAvailable?: (availableQty: number) => void;
  onBackToOptions?: () => void;
}

export function RestockNoticeModal({
  open,
  onOpenChange,
  product,
  variantSummary,
  demandedQuantity,
  availableStock,
  existingCartQty = 0,
  initialStep = "oops",
  actionType = "cart",
  onAddToCartAvailable,
  onBackToOptions,
}: RestockNoticeModalProps) {
  const customerUser = useCustomerAuth((s) => s.user);
  const [step, setStep] = useState<"oops" | "notify" | "submitted">(() => initialStep);
  const [notifyEmail, setNotifyEmail] = useState(() => customerUser?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  React.useEffect(() => {
    if (open) {
      setStep(initialStep);
      if (customerUser?.email && !notifyEmail) {
        setNotifyEmail(customerUser.email);
      }
    }
  }, [open, initialStep, customerUser?.email]);

  const maxAddable = Math.max(0, availableStock);
  const productImage = product.images?.[0] || "https://placehold.co/600x800?text=Product";

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setStep(initialStep);
      }, 200);
    }
  };

  const handleSubmitNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = notifyEmail.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRestockRequest({
        customerEmail: cleanEmail,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variant: variantSummary || undefined,
        demandedQuantity,
        availableStock,
      });

      setSubmittedEmail(cleanEmail);
      setStep("submitted");
      toast.success("Request received! We'll notify you as soon as more stock arrives.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[92vw] max-w-[430px] rounded-2xl p-5 sm:p-6 bg-background shadow-2xl border border-border/80 focus:outline-none max-h-[92vh] overflow-y-auto overflow-x-hidden min-w-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {step === "oops"
              ? "Stock Notice"
              : step === "notify"
              ? "Restock Alert"
              : "Request Confirmed"}
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: OOPS / STOCK NOTICE VIEW */}
        {step === "oops" && (
          <div className="py-2 space-y-5 text-center animate-in fade-in-50 duration-200 w-full min-w-0 max-w-full overflow-hidden">
            <div className="mx-auto size-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
              <ShoppingBag className="size-6 stroke-[1.75]" />
            </div>

            <div className="space-y-2 w-full min-w-0">
              <h3 className="font-display font-bold text-xl text-foreground tracking-tight">
                {availableStock === 0 ? "Currently Out of Stock" : "Oops! Almost yours"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {availableStock === 0 ? (
                  "We are currently out of stock for this item. But don’t worry, we’d love to notify you as soon as it arrives."
                ) : (
                  <>
                    We are sorry, we currently have{" "}
                    <span className="font-semibold text-foreground">
                      {availableStock} {availableStock === 1 ? "piece" : "pieces"}
                    </span>{" "}
                    left, fewer than you need. But don’t worry, we’d love to help you get yours as soon as it’s available again.
                  </>
                )}
              </p>
            </div>

            {/* Demanded Item Details Box */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-surface/60 flex items-center gap-3 text-left w-full min-w-0 max-w-full overflow-hidden">
              <img
                src={productImage}
                alt={product.name}
                className="size-14 rounded-lg object-cover shrink-0 border border-border/50"
              />
              <div className="min-w-0 flex-1 text-xs overflow-hidden">
                <p className="font-semibold text-foreground truncate text-sm block min-w-0" title={product.name}>
                  {product.name}
                </p>
                {variantSummary && (
                  <p className="text-muted-foreground mt-0.5 truncate block min-w-0" title={variantSummary}>
                    {variantSummary}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 min-w-0 truncate">
                  <span className="text-muted-foreground font-medium shrink-0">
                    Requested: <strong className="text-foreground">{demandedQuantity}</strong>
                  </span>
                  <span className="text-muted-foreground shrink-0">·</span>
                  <span className="text-amber-700 dark:text-amber-400 font-medium shrink-0">
                    Available: <strong>{availableStock}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1 w-full min-w-0">
              <button
                type="button"
                onClick={() => setStep("notify")}
                className="w-full bg-brand-pink text-ink font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-ink hover:text-white transition-colors cursor-pointer shadow-sm text-sm"
              >
                Notify me when it’s available
              </button>

              {availableStock > 0 && maxAddable > 0 && onAddToCartAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    onAddToCartAvailable(maxAddable);
                    handleOpenChange(false);
                  }}
                  className="w-full py-2.5 rounded-full border border-border text-foreground hover:bg-secondary font-medium text-xs transition-colors cursor-pointer"
                >
                  {actionType === "buy_now"
                    ? `Buy the ${maxAddable} available instead`
                    : `Add available (${maxAddable}) to cart instead`}
                </button>
              )}

              {onBackToOptions && (
                <button
                  type="button"
                  onClick={onBackToOptions}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer pt-1 block mx-auto"
                >
                  ← Choose different options or quantity
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: NOTIFY FORM */}
        {step === "notify" && (
          <form onSubmit={handleSubmitNotify} className="py-2 space-y-5 animate-in fade-in-50 duration-200 w-full min-w-0 max-w-full overflow-hidden">
            <div className="mx-auto size-12 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-brand-pink/30 flex items-center justify-center text-brand-pink shadow-2xs">
              <Bell className="size-6 stroke-[1.75]" />
            </div>

            <div className="space-y-1.5 text-center w-full min-w-0">
              <h3 className="font-display font-bold text-xl text-foreground tracking-tight">
                Get Notified When Available
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Leave your email below and our team will notify you as soon as more stock arrives.
              </p>
            </div>

            {/* Item Preview Card */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-surface/60 flex items-center gap-3 text-left w-full min-w-0 max-w-full overflow-hidden">
              <img
                src={productImage}
                alt={product.name}
                className="size-14 rounded-lg object-cover shrink-0 border border-border/50"
              />
              <div className="min-w-0 flex-1 text-xs overflow-hidden">
                <p className="font-semibold text-foreground truncate text-sm block min-w-0" title={product.name}>
                  {product.name}
                </p>
                {variantSummary && (
                  <p className="text-muted-foreground mt-0.5 truncate block min-w-0" title={variantSummary}>
                    {variantSummary}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 min-w-0 truncate">
                  <span className="text-muted-foreground font-medium shrink-0">
                    Requested: <strong className="text-foreground">{demandedQuantity}</strong>
                  </span>
                  <span className="text-muted-foreground shrink-0">·</span>
                  <span className="text-amber-700 dark:text-amber-400 font-medium shrink-0">
                    Available: <strong>{availableStock}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-foreground block">
                Email Address <span className="text-brand-pink">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  required
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="e.g. you@example.com"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-pink text-ink font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-ink hover:text-white transition-colors cursor-pointer shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Bell className="size-4" /> Notify Me
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("oops")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer pt-1 block mx-auto"
              >
                ← Back
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUBMITTED CONFIRMATION */}
        {step === "submitted" && (
          <div className="py-4 space-y-5 text-center animate-in fade-in-50 duration-200 w-full min-w-0 max-w-full overflow-hidden">
            <div className="mx-auto size-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <CheckCircle2 className="size-7 stroke-[2]" />
            </div>

            <div className="space-y-2 w-full min-w-0">
              <h3 className="font-display font-bold text-xl text-foreground tracking-tight">
                You're on the list!
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto break-words">
                We've noted your demand for{" "}
                <strong className="text-foreground">
                  {demandedQuantity}x {product.name}
                </strong>
                {variantSummary ? ` (${variantSummary})` : ""}.
                We'll email you at <strong className="text-foreground break-all">{submittedEmail}</strong> as soon as more stock becomes available.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="w-full bg-foreground text-background font-semibold py-3.5 rounded-full hover:bg-foreground/90 transition-colors cursor-pointer shadow-sm text-sm mt-3"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
