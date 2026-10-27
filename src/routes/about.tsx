import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowRight, CheckCircle2, ShieldCheck, Target } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — EIMAH" },
      { name: "description", content: "EIMAH is a modern commerce platform bringing quality products closer to consumers and businesses." },
      { property: "og:title", content: "About — EIMAH" },
      { property: "og:description", content: "The story behind EIMAH — retail and procurement, done right." },
    ],
  }),
});

function AboutPage() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface py-10 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-pink/10 via-transparent to-transparent" />

        <div className="container-eimah relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl tracking-tight text-balance text-ink leading-[1.1] fade-up">
            Eimah is more than a <br className="hidden md:block" />
            <span className="text-brand-pink">shopping destination.</span>
          </h1>

          <p className="mt-6 text-xl md:text-2xl text-ink/80 font-medium text-balance max-w-3xl fade-up" style={{ animationDelay: '100ms' }}>
            We are your trusted access to quality products you can buy with confidence.
          </p>

          <div className="w-16 h-1 bg-gradient-to-r from-brand-pink to-brand-lime mt-6 rounded-full fade-up" style={{ animationDelay: '200ms' }} />

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl fade-up text-justify" style={{ animationDelay: '300ms' }}>
            EIMAH is a modern commerce platform serving two audiences with one obsession: quality. We source premium products globally, curate them tightly for everyday shoppers, and run a dedicated procurement arm for businesses that need reliable product access at scale.
          </p>
        </div>
      </section>

      {/* Audiences Section */}
      <section className="container-eimah py-6 md:py-10">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Consumers Card */}
          <div className="rounded-3xl bg-ink text-white p-8 md:p-12 relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">Eimah for Consumers</h2>
              <p className="text-white/80 leading-relaxed text-lg mb-8">
                We curate quality, functional, and timeless products designed to complement everyday living. Every product is intentionally selected to deliver value, elevate daily experiences, and fit seamlessly into different lifestyles.
              </p>
              <Link to="/shop" className="inline-flex items-center gap-2 bg-brand-pink text-ink font-display font-semibold px-6 py-3 rounded-full hover:bg-white transition-colors">
                Go to shop <ArrowRight className="size-4" />
              </Link>
            </div>
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-pink/30 transition-colors duration-700" />
          </div>

          {/* Businesses Card */}
          <div className="rounded-3xl bg-surface-2 p-8 md:p-12 relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-ink mb-6">Eimah for Businesses</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                We help entrepreneurs, startups, and established businesses navigate global trade through practical business solutions that simplify sourcing, procurement, importation, supplier verification, and professional training.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                By combining industry expertise with a collaborative approach, we support businesses in making informed decisions, streamlining operations, and building sustainable growth.
              </p>
              <Link to="/solutions" className="inline-flex items-center gap-2 bg-brand-lime text-ink font-display font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
                Explore solutions <ArrowRight className="size-4" />
              </Link>
            </div>
            {/* Subtle glow effect */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-lime/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 group-hover:bg-brand-lime/30 transition-colors duration-700" />
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="container-eimah py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-widest text-brand-pink font-semibold mb-4">What drives us</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-ink">Our Core Values</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              t: "Quality",
              d: "We are committed to delivering thoughtfully curated products and practical solutions that meet high standards of excellence, reliability, and value.",
              icon: ShieldCheck,
              tint: "text-brand-pink",
              bg: "bg-brand-pink/10"
            },
            {
              t: "Integrity",
              d: "We build lasting relationships through honesty, transparency, and accountability, earning the trust of both individuals and businesses.",
              icon: CheckCircle2,
              tint: "text-lime-600",
              bg: "bg-brand-lime/20"
            },
            {
              t: "Purpose",
              d: "We approach every product, service, and decision with intention—creating meaningful solutions that support everyday living and sustainable business growth.",
              icon: Target,
              tint: "text-amber-500",
              bg: "bg-amber-500/10"
            },
          ].map((v) => (
            <div key={v.t} className="rounded-3xl bg-surface p-8 border border-border/50 hover:border-border transition-colors">
              <div className={`w-12 h-12 rounded-full ${v.bg} flex items-center justify-center mb-6`}>
                <v.icon className={`size-6 ${v.tint}`} />
              </div>
              <h3 className="font-display font-bold text-2xl text-ink mb-4">{v.t}</h3>
              <p className="text-muted-foreground leading-relaxed">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="container-eimah py-6 pb-6">
        <div className="relative overflow-hidden rounded-3xl bg-ink text-white p-10 md:p-16 text-center max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/20 via-transparent to-brand-lime/20 opacity-50" />
          <div className="relative z-10">
            <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance mb-8">
              Ready to experience EIMAH?
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-brand-pink text-ink font-display font-semibold px-8 py-4 rounded-full hover:bg-white transition-colors text-lg">
                Go to shop <ArrowRight className="size-5" />
              </Link>
              <Link to="/solutions" className="inline-flex items-center gap-2 border border-white/30 text-white font-display font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-ink transition-colors text-lg">
                Explore solutions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
