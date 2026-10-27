import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { usePopupsQuery } from "@/hooks/queries/useContentQuery";
import { getPopupTargetUrl } from "@/lib/admin-data";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const DISMISSAL_KEY = "eimah_popup_dismissed_at";

export function PromoPopupModal() {
  const { data: popups = [] } = usePopupsQuery();
  const [isOpen, setIsOpen] = useState(false);

  // Find the active popup announcement
  const activePopup = popups.find((p) => p.status === "Active");

  useEffect(() => {
    if (!activePopup) return;

    // Check 2-hour cooldown timer in localStorage
    const dismissedAtStr = localStorage.getItem(DISMISSAL_KEY);

    if (dismissedAtStr) {
      const dismissedAt = Number(dismissedAtStr);
      const timeSinceDismissal = Date.now() - dismissedAt;

      // If dismissed less than 2 hours ago, do not display popup
      if (timeSinceDismissal < TWO_HOURS_MS) {
        return;
      }
    }

    // Trigger popup display after 1.5 seconds delay after site load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [activePopup]);

  // Lock body scrolling when popup is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleDismiss = () => {
    // Save current timestamp to localStorage for 2-hour cooldown
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    document.body.style.overflow = "";
    setIsOpen(false);
  };

  if (!isOpen || !activePopup) return null;

  const targetUrl = getPopupTargetUrl(activePopup.ctaTarget, activePopup.ctaUrl);
  const isExternal = targetUrl.startsWith("http://") || targetUrl.startsWith("https://");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-background rounded-[2rem] p-7 sm:p-9 shadow-2xl border border-border/80 text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          aria-label="Close announcement"
        >
          <X className="size-5" />
        </button>

        {/* Status Badge */}
        <div className="pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-pink/15 text-brand-pink text-xs font-semibold tracking-wide">
            <span>Special Announcement</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
            {activePopup.title}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-1">
            {activePopup.body}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isExternal ? (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink text-white font-semibold py-3.5 px-6 rounded-full hover:bg-black transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              <span>{activePopup.ctaText || "Explore Solutions"}</span>
              <ArrowRight className="size-4" />
            </a>
          ) : (
            <Link
              to={targetUrl}
              onClick={handleDismiss}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink text-white font-semibold py-3.5 px-6 rounded-full hover:bg-black transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              <span>{activePopup.ctaText || "Explore Solutions"}</span>
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
