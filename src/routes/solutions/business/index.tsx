import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, CheckCircle2, Search, Briefcase, Globe, Ship } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSolutionsQuery } from "@/hooks/queries/useContentQuery";
import { formatNaira } from "@/lib/mock-data";
import heroImgUrl from "@/assets/solutions-hero.jpg";

export const Route = createFileRoute("/solutions/business/")({
  component: BusinessSolutionsIndexPage,
  head: () => ({
    meta: [
      { title: "Business Solutions — EIMAH" },
      { name: "description", content: "End-to-end procurement, product sourcing, supplier verification, and importation solutions for your business." },
    ],
  }),
});

const BUSINESS = [
  {
    id: "importation",
    solutionId: "S-04",
    title: "Importation",
    summary: "We manage the purchasing and shipping of your products from China to Nigeria, ensuring a smooth and well-coordinated import process.",
    details: "Our Importation Service is designed for businesses that already know the products they want but need a trusted partner to purchase and coordinate the shipment. We handle communication with suppliers, oversee the purchasing process, coordinate logistics, and ensure your products are shipped safely to Nigeria.",
    highlights: ["Supplier communication", "Purchase coordination", "Shipping management", "Logistics support", "Import guidance", "Progress updates"],
    cta: "Explore Importation",
    icon: Ship,
    color: "text-brand-pink",
    bg: "bg-brand-pink/5",
  },
  {
    id: "procurement",
    solutionId: "S-02",
    title: "Procurement",
    summary: "We purchase products on your behalf from verified suppliers.",
    details: "If you've already identified the products you need but prefer an experienced team to handle negotiations and purchasing, our Procurement Service is the ideal solution. We work directly with suppliers to purchase your products according to your specifications while ensuring clear communication throughout the process.",
    highlights: ["Product purchasing", "Supplier negotiations", "Order placement", "Purchase coordination", "Supplier communication", "Process monitoring"],
    cta: "Explore Procurement",
    icon: Briefcase,
    color: "text-emerald-600",
    bg: "bg-brand-mint/10",
  },
  {
    id: "sourcing",
    solutionId: "S-03",
    title: "Product Sourcing",
    summary: "Our Product Sourcing service helps businesses identify reliable manufacturers and suppliers that align with their product requirements, quality expectations, and budget.",
    details: "Our Product Sourcing service is designed to help startups, growing businesses, and established enterprises connect with suitable suppliers that meet their specific business needs. We take the time to understand your product specifications and sourcing objectives before identifying and presenting supplier options that align with your requirements.",
    highlights: ["Consumer products", "Fashion items", "Home essentials", "Electronics accessories", "Beauty products", "Lifestyle products"],
    cta: "Explore Product Sourcing",
    icon: Globe,
    color: "text-amber-500",
    bg: "bg-brand-yellow/10",
  }
];

function BusinessSolutionsIndexPage() {
  const { data: solutions = [] } = useSolutionsQuery();

  return (
    <SiteLayout>
      {/* ── Breadcrumb ── */}
      <div className="container-eimah pt-6">
        <Link to="/solutions" className="text-sm text-muted-foreground hover:text-ink transition-colors flex items-center gap-2">
          <ArrowRight className="size-4 rotate-180" /> Back to Solutions Hub
        </Link>
      </div>

      {/* ── Hero ── */}
      <section className="container-eimah pt-8 mb-16 md:mb-32">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="md:col-span-6 lg:col-span-5 order-2 md:order-1">
            <div className="inline-flex items-center gap-2 mb-6 text-brand-pink">
              <Building2 className="size-5" />
              <span className="text-xs uppercase tracking-widest font-semibold">Business Services</span>
            </div>
            <h1 className="font-display font-bold text-5xl lg:text-7xl tracking-tight text-balance leading-[1.05]">
              Import & Global Trade Solutions.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Helping startups, growing businesses, and enterprises source, procure, and import products confidently into Nigeria while minimizing risk and simplifying the entire process.
            </p>
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 inline-flex items-center gap-2 bg-ink text-white font-display font-semibold px-8 py-4 rounded-full hover:bg-black/80 transition-colors cursor-pointer"
            >
              Explore Services <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="md:col-span-6 lg:col-span-7 order-1 md:order-2">
            <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-ink/5">
              <img
                src={heroImgUrl}
                alt="EIMAH Global Trade"
                className="w-full h-full object-cover scale-[1.02] hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/20 to-transparent pointer-events-none mix-blend-overlay" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Directory ── */}
      <section id="services" className="container-eimah mb-24 md:mb-32 scroll-mt-24">
        <div className="grid lg:grid-cols-2 gap-6">
          {BUSINESS.map((s) => {
            const solData = solutions.find((item) => item.id === s.solutionId);
            const regularPrice = solData?.price;
            const hasDiscount = Boolean(solData?.discountPercent && solData.discountPercent > 0);
            const effectivePrice = hasDiscount && solData?.discountPrice ? solData.discountPrice : regularPrice;

            return (
              <Link key={s.id} to={`/solutions/business/${s.id}` as any} className="group relative overflow-hidden rounded-3xl border border-border bg-background transition-all hover:border-foreground/20 hover:shadow-xl hover:shadow-ink/5 flex flex-col">
                <div className={`absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 group-hover:scale-110 ${s.color} pointer-events-none`}>
                  <s.icon className="w-48 h-48 -mr-12 -mt-12" />
                </div>

                <div className="relative p-8 md:p-10 flex flex-col flex-1 h-full">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className={`h-12 w-12 rounded-xl grid place-items-center ${s.bg}`}>
                      <s.icon className={`size-6 ${s.color}`} />
                    </div>
                    {hasDiscount && solData?.discountPercent && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-pink text-ink shadow-xs">
                        {solData.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-3xl md:text-4xl mb-4">{s.title}</h3>
                  <p className="text-lg font-medium leading-relaxed mb-6 max-w-lg">{s.summary}</p>

                  <div className="mt-auto pt-6 border-t border-border flex-1 flex flex-col justify-end">
                    <div>
                      <span
                        className="inline-flex items-center gap-2 font-display font-semibold border-b-2 border-foreground pb-1 group-hover:opacity-70 transition-opacity"
                      >
                        {s.cta} <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
