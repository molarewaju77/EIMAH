import { CheckCircle2, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

export type PaymentSuccessModalData = {
  id: string;
  solutionTitle: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  track?: "Business" | "Academy";
  category?: "Business" | "Learning";
} | null;

export function PaymentSuccessModal({
  data,
  onClose,
}: {
  data: PaymentSuccessModalData;
  onClose: () => void;
}) {
  if (!data) return null;

  const isTraining = data.track === "Academy" || data.category === "Learning";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-background rounded-3xl p-6 sm:p-10 shadow-2xl border border-border/80 text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {/* Top Success Badge */}
        <div className="mx-auto size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-500/5">
          <CheckCircle2 className="size-9 stroke-[2.2]" />
        </div>

        {/* Main Content Area */}
        <div className="space-y-4 max-w-md mx-auto">
          <div className="space-y-1.5">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {isTraining ? "Application Received!" : "Request Received!"}
            </h3>
            <p className="text-base font-medium text-muted-foreground">
              Thank you for choosing <span className="text-foreground font-semibold">Eimah</span>.
            </p>
          </div>

          <div className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {isTraining ? (
              <p>
                Your application for{" "}
                <strong className="text-foreground font-semibold">{data.solutionTitle}</strong> has
                been successfully submitted and is now under review. We’ll contact you with the
                next steps.
              </p>
            ) : (
              <p>
                Your application for{" "}
                <strong className="text-foreground font-semibold">{data.solutionTitle}</strong> has
                been successfully submitted. Our team will review your request and contact you with
                the next steps.
              </p>
            )}
          </div>

          <p className="text-sm sm:text-base font-semibold text-foreground pt-1">
            {isTraining
              ? "We appreciate your interest in Eimah."
              : "We look forward to serving you."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
          <Link
            to="/solutions"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/90 text-foreground font-semibold py-3.5 px-5 rounded-full transition-colors text-sm cursor-pointer shadow-2xs"
          >
            Explore Solutions
          </Link>
          <Link
            to="/"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center bg-ink text-white font-semibold py-3.5 px-5 rounded-full hover:bg-black transition-colors shadow-md text-sm cursor-pointer"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
