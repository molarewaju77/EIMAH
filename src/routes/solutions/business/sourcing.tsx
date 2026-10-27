import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Globe } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { formatNaira } from "@/lib/mock-data";
import { useSolutionItemQuery } from "@/hooks/queries/useContentQuery";

export const Route = createFileRoute("/solutions/business/sourcing")({
  component: SourcingPage,
  head: () => ({
    meta: [
      { title: "Product Sourcing — EIMAH" },
      {
        name: "description",
        content:
          "Identify reliable manufacturers and suppliers that align with your product requirements.",
      },
    ],
  }),
});

function SourcingPage() {
  const { solution } = useSolutionItemQuery("S-03");

  const regularPrice = solution?.price ?? 20000;
  const hasDiscount = Boolean(solution?.discountPercent && solution.discountPercent > 0);
  const effectivePrice =
    hasDiscount && solution?.discountPrice ? solution.discountPrice : regularPrice;
  const discountPercent = solution?.discountPercent || 0;

  return (
    <SiteLayout>
      {/* ── Breadcrumb ── */}
      <div className="container-eimah pt-6">
        <Link
          to="/solutions/business"
          className="text-sm text-muted-foreground hover:text-ink transition-colors flex items-center gap-2"
        >
          <ArrowRight className="size-4 rotate-180" /> Back to Business Services
        </Link>
      </div>

      {/* ── Top Hero Section ── */}
      <section className="container-eimah pt-8 mb-10 md:mb-12">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-yellow/10 text-amber-600 mb-6">
            <Globe className="size-4" />
            <span className="text-sm font-semibold tracking-wide">Product Sourcing Service</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance leading-[1.1] mb-6">
            Find the perfect supplier for your products.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            We help you identify reliable manufacturers and suppliers that align with your product
            requirements, quality expectations, and budget.
          </p>
        </div>
      </section>

      {/* ── 2-Column Content Grid ── */}
      <section className="container-eimah pb-20">
        <div className="grid md:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Service Overview */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl mb-4 text-foreground">
                Service Overview
              </h2>
              <div className="prose prose-lg text-muted-foreground prose-p:leading-relaxed space-y-4">
                <p>
                  Our Product Sourcing service is designed to help startups, growing businesses, and
                  established enterprises connect with suitable suppliers that meet their specific
                  business needs.
                </p>
                <p>
                  Whether you're developing a custom product, launching a private label, or looking
                  for better manufacturing terms, our team simplifies supplier discovery and
                  vetting.
                </p>
              </div>
            </div>

            {/* Desktop Fee & Book Now Block */}
            <div className="hidden md:block pt-4">
              <hr className="my-6 border-border/60" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider block mb-1">
                    Service Fee
                  </span>
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-bold font-display text-foreground leading-none">
                      {formatNaira(effectivePrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs sm:text-sm text-muted-foreground line-through font-medium mt-1">
                        {formatNaira(regularPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to="/solutions/business/sourcing/apply"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-black text-white font-semibold text-xs sm:text-base py-3 px-5 sm:py-3.5 sm:px-8 rounded-md hover:bg-zinc-800 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <span>Book Now</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: What's Included Card */}
          <div className="md:col-span-5 md:sticky md:top-24 space-y-6">
            <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl space-y-4 shadow-xs">
              <h3 className="font-semibold text-lg text-foreground">What's Included</h3>
              <ul className="space-y-3.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow shrink-0 mt-2" />
                  <span>Vetted manufacturer list tailored to your specs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow shrink-0 mt-2" />
                  <span>Initial pricing & MOQ (Minimum Order Quantity) estimates</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow shrink-0 mt-2" />
                  <span>Supplier verification & background check summary</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow shrink-0 mt-2" />
                  <span>1-on-1 strategy consultation call</span>
                </li>
              </ul>
            </div>

            {/* Mobile Fee & Book Now Block (after What's Included) */}
            <div className="block md:hidden pt-2">
              <hr className="mb-6 border-border/60" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider block mb-1">
                    Service Fee
                  </span>
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-bold font-display text-foreground leading-none">
                      {formatNaira(effectivePrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs sm:text-sm text-muted-foreground line-through font-medium mt-1">
                        {formatNaira(regularPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to="/solutions/business/sourcing/apply"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-black text-white font-semibold text-xs sm:text-base py-3 px-5 sm:py-3.5 sm:px-8 rounded-md hover:bg-zinc-800 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <span>Book Now</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
