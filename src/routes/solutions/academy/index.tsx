import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSolutionsQuery } from "@/hooks/queries/useContentQuery";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/solutions/academy/")({
  component: AcademyIndexPage,
  head: () => ({
    meta: [
      { title: "EIMAH Academy — Training & Development" },
      { name: "description", content: "Build the knowledge and skills to navigate global trade successfully with EIMAH training programs." },
    ],
  }),
});

const TRAINING = [
  {
    id: "importation",
    solutionId: "S-05",
    title: "China Importation Training",
    summary: "Learn the complete process of importing products from China, from understanding suppliers and placing orders to managing logistics and receiving your goods.",
    details: "Our China Importation Training equips entrepreneurs and business owners with practical knowledge of the import process, helping them understand supplier selection, purchasing procedures, shipping considerations, and the key steps involved in successfully importing products from China.",
    learn: ["Understanding the China importation process", "How to identify and evaluate suppliers", "Product research and sourcing fundamentals", "Understanding supplier communication and negotiation", "Order placement and purchasing processes", "Import cost considerations", "Shipping and logistics overview", "Common import challenges and how to avoid them", "Best practices for building a sustainable import business"],
    who: ["Aspiring importers", "Entrepreneurs starting a product business", "Business owners expanding their product range", "Individuals interested in international sourcing", "Companies looking to build internal import knowledge"],
    cta: "Explore Importation",
    theme: "bg-ink text-white",
    btnTheme: "bg-brand-lime text-ink hover:opacity-90",
    checkTheme: "text-brand-lime",
    whoDot: "bg-white",
  },
  {
    id: "procurement",
    solutionId: "S-06",
    title: "Procurement Training",
    summary: "Develop the skills to source, evaluate, negotiate, and manage purchases effectively while building reliable supplier relationships.",
    details: "Our Procurement Training helps individuals and businesses understand how to manage purchasing decisions effectively, work with suppliers, negotiate better terms, and build a reliable procurement process.",
    learn: ["Fundamentals of procurement", "Understanding the procurement process", "Finding and evaluating suppliers", "Supplier assessment and selection", "Product and price evaluation", "Negotiation strategies", "Managing supplier relationships", "Purchase planning and order management", "Procurement best practices", "Avoiding common purchasing mistakes"],
    who: ["Entrepreneurs", "Business owners", "Procurement professionals", "E-commerce operators", "Retail businesses", "Individuals managing business purchasing"],
    cta: "Explore Procurement",
    theme: "bg-brand-lime text-ink",
    btnTheme: "bg-ink text-white hover:opacity-90",
    checkTheme: "text-ink",
    whoDot: "bg-ink",
  }
];

function AcademyIndexPage() {
  const { data: solutions = [] } = useSolutionsQuery();

  return (
    <SiteLayout>
      {/* ── Breadcrumb ── */}
      <div className="container-eimah pt-6 pb-4">
        <Link to="/solutions" className="text-sm text-muted-foreground hover:text-ink transition-colors flex items-center gap-2">
          <ArrowRight className="size-4 rotate-180" /> Back to Solutions Hub
        </Link>
      </div>

      {/* ── Immersive Training Section ── */}
      <section className="container-eimah pt-8 mb-24 md:mb-32">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center gap-3">
            <GraduationCap className="size-5 text-lime-600" />
            <h2 className="font-display font-bold text-2xl md:text-3xl uppercase tracking-widest">EIMAH Academy</h2>
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight text-balance mb-6">
            Build the Knowledge to Navigate Global Trade.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We provide practical business training designed to help individuals and businesses understand the processes, strategies, and best practices involved in China importation and procurement.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {TRAINING.map((s) => {
            const solData = solutions.find((item) => item.id === s.solutionId);
            const regularPrice = solData?.price;
            const hasDiscount = Boolean(solData?.discountPercent && solData.discountPercent > 0);
            const effectivePrice = hasDiscount && solData?.discountPrice ? solData.discountPrice : regularPrice;

            return (
              <Link key={s.id} to={`/solutions/academy/${s.id}` as any} className={cn("group rounded-[2.5rem] p-8 md:p-12 flex flex-col transition-transform hover:scale-[1.01] duration-500", s.theme)}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs uppercase font-bold tracking-widest opacity-70">Training Program</span>
                  {hasDiscount && solData?.discountPercent && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-pink text-ink shadow-xs">
                      {solData.discountPercent}% OFF
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-3xl md:text-4xl">{s.title}</h3>
                <p className="mt-4 text-xl font-medium leading-relaxed opacity-90">{s.summary}</p>

                <div className="flex-1 min-h-8" />
                <div className="mt-6">
                  <div
                    className={cn("inline-flex items-center justify-between gap-4 font-display font-semibold px-6 md:px-8 py-4 rounded-full transition-all text-base md:text-lg", s.btnTheme)}
                  >
                    <span className="text-left leading-tight">{s.cta}</span> <ArrowRight className="size-5 shrink-0" />
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
