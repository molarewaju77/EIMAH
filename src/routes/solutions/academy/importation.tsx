import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { formatNaira } from "@/lib/mock-data";
import { useSolutionItemQuery } from "@/hooks/queries/useContentQuery";

export const Route = createFileRoute("/solutions/academy/importation")({
  component: AcademyImportationPage,
  head: () => ({
    meta: [
      { title: "China Importation Training — EIMAH Academy" },
      { name: "description", content: "Learn the complete process of importing products from China." },
    ],
  }),
});

function AcademyImportationPage() {
  const { solution } = useSolutionItemQuery("S-05");

  const regularPrice = solution?.price ?? 40000;
  const hasDiscount = Boolean(solution?.discountPercent && solution.discountPercent > 0);
  const effectivePrice = hasDiscount && solution?.discountPrice ? solution.discountPrice : regularPrice;

  return (
    <SiteLayout>
      {/* ── Breadcrumb ── */}
      <div className="container-eimah pt-6">
        <Link to="/solutions/academy" className="text-sm text-muted-foreground hover:text-ink transition-colors flex items-center gap-2">
          <ArrowRight className="size-4 rotate-180" /> Back to Training Academy
        </Link>
      </div>

      {/* ── Top Hero Section ── */}
      <section className="container-eimah pt-8 mb-10 md:mb-12">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-lime/10 text-lime-700 mb-6">
            <GraduationCap className="size-4" />
            <span className="text-sm font-semibold tracking-wide">EIMAH Academy</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance leading-[1.1] mb-6">
            China Importation Training.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Learn the complete process of importing products from China, from understanding suppliers and placing orders to managing logistics and receiving your goods.
          </p>
        </div>
      </section>

      {/* ── 2-Column Content Grid ── */}
      <section className="container-eimah pb-20">
        <div className="grid md:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Course Overview */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl mb-4 text-foreground">
                Course Overview
              </h2>
              <div className="prose prose-lg text-muted-foreground prose-p:leading-relaxed space-y-4">
                <p>
                  Our China Importation Training equips entrepreneurs and business owners with practical knowledge of the import process, helping them understand supplier selection, purchasing procedures, shipping considerations, and the key steps involved in successfully importing products from China.
                </p>
              </div>
            </div>

            {/* Desktop Tuition Fee & Book Now Block */}
            <div className="hidden md:block pt-4">
              <hr className="my-6 border-border/60" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider block mb-1">
                    Tuition Fee
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
                  to="/solutions/academy/importation/apply"
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

          {/* Right Column: What You Will Learn Card */}
          <div className="md:col-span-5 md:sticky md:top-24 space-y-6">
            <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl space-y-4 shadow-xs">
              <h3 className="font-semibold text-lg text-foreground">What You Will Learn</h3>
              <ul className="space-y-3.5">
                {[
                  "Understanding suppliers & platforms",
                  "Evaluating product quality & specifications",
                  "Placing orders & payment methods",
                  "Shipping options: Air vs Sea freight",
                  "Customs clearance considerations",
                  "Avoiding common import pitfalls",
                ].map((h, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
                    <CheckCircle2 className="size-4 shrink-0 text-lime-600" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile Tuition Fee & Book Now Block (after What You Will Learn) */}
            <div className="block md:hidden pt-2">
              <hr className="mb-6 border-border/60" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider block mb-1">
                    Tuition Fee
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
                  to="/solutions/academy/importation/apply"
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
