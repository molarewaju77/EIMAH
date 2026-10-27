import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, GraduationCap } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { cn } from "@/lib/utils";

import heroImgUrl from "@/assets/solution.jpeg";

export const Route = createFileRoute("/solutions/")({
  component: SolutionsHubPage,
  head: () => ({
    meta: [
      { title: "Solutions — EIMAH" },
      { name: "description", content: "Choose between EIMAH Business Services and EIMAH Training Academy." },
    ],
  }),
});

function SolutionsHubPage() {
  return (
    <SiteLayout>
      {/* ── Full Width Hero Image ── */}
      <section className="relative w-full h-[50vh] md:h-[40vh] max-h-[400px] min-h-[300px] mb-16 md:mb-18">
        <img
          src={heroImgUrl}
          alt="EIMAH Solutions"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </section>

      <section className="container-eimah mb-32">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center mb-16 md:mb-20">
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance leading-[1.05]">
            Business Solutions Designed for Growth
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Helping entrepreneurs, startups, and businesses navigate global trade through tailored business solutions. Explore our specialised services below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10 max-w-6xl mx-auto w-full">
          {/* Business Path */}
          <Link
            to="/solutions/business"
            className="group relative overflow-hidden rounded-[2.5rem] p-10 md:p-14 bg-surface border border-border hover:border-foreground/20 transition-all duration-500 hover:shadow-2xl hover:shadow-ink/10 flex flex-col"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-700 group-hover:scale-110 pointer-events-none text-brand-pink">
              <Building2 className="w-64 h-64 -mr-16 -mt-16" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="h-16 w-16 rounded-2xl bg-brand-pink/10 grid place-items-center mb-8 text-brand-pink">
                <Building2 className="size-8" />
              </div>

              <h2 className="font-display font-bold text-4xl mb-4">Partner with EIMAH</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-md">
                End-to-end procurement, product sourcing, supplier verification, and importation solutions for your business.
              </p>

              <div className="mt-auto pt-6 border-t border-border/50">
                <div className="inline-flex items-center gap-2 font-display font-semibold text-lg group-hover:gap-4 transition-all text-ink">
                  Explore Business Services <ArrowRight className="size-5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Academy Path */}
          <Link
            to="/solutions/academy"
            className="group relative overflow-hidden rounded-[2.5rem] p-10 md:p-14 bg-ink border border-ink hover:border-brand-lime transition-all duration-500 hover:shadow-2xl hover:shadow-ink/20 flex flex-col"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-700 group-hover:scale-110 pointer-events-none text-white">
              <GraduationCap className="w-64 h-64 -mr-16 -mt-16" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col text-white">
              <div className="h-16 w-16 rounded-2xl bg-white/10 grid place-items-center mb-8 text-brand-lime">
                <GraduationCap className="size-8" />
              </div>

              <h2 className="font-display font-bold text-4xl mb-4">Learn with EIMAH</h2>
              <p className="text-lg text-white/70 leading-relaxed mb-12 max-w-md">
                Build the knowledge and skills to navigate global trade successfully with our expert-led training programs.
              </p>

              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="inline-flex items-center gap-2 font-display font-semibold text-lg group-hover:gap-4 transition-all text-brand-lime">
                  Explore Training Academy <ArrowRight className="size-5" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
