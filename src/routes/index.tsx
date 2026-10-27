import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Truck,
  ShieldCheck,
  Package,
  Briefcase,
  Search,
  Globe,
  Gem,
  FileCheck,
  Ship,
  GraduationCap,
  BookOpen,
} from "lucide-react";


import { SiteLayout } from "@/components/site/SiteLayout";
import { Preloader } from "@/components/site/Preloader";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductCardSkeleton } from "@/components/site/ProductCardSkeleton";
import { FAQSection } from "@/components/site/FAQSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoriesQuery } from "@/hooks/queries/useCategoriesQuery";
import { usePaginatedProductsQuery, useProductsQuery } from "@/hooks/queries/useProductsQuery";
import { useBannersQuery } from "@/hooks/queries/useContentQuery";
import { getBannerTargetUrl } from "@/lib/admin-data";
import heroBg from "@/assets/hero-bg.jpeg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "EIMAH — Quality products, closer to consumers & businesses" },
      {
        name: "description",
        content:
          "Premium curated retail and business procurement solutions. Shop clothing, shoes, bags and more with EIMAH.",
      },
      { property: "og:title", content: "EIMAH — Quality products, closer to you" },
      {
        property: "og:description",
        content:
          "Shop premium products and unlock business procurement, sourcing, and importation with EIMAH.",
      },
    ],
  }),
});

function Home() {
  return (
    <SiteLayout showAnnouncement={false}>
      <Preloader />
      <Hero />
      <Marquee />

      <FeaturedCategories />
      <FeaturedProductsSection />
      <PromoBanner />
      <ValueProps />
      <BusinessSolutions />
      <LearningSolutions />
      <FAQSection />
      <FinalCTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] min-h-[650px] flex flex-col justify-center overflow-hidden">
      {/* Immersive Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          className="absolute bottom-0 w-full h-[115%] object-cover object-bottom"
          alt="EIMAH Shopping Bags"
        />
        {/* Subtle light gradient in the top-left corner specifically for the logo */}
        <div className="absolute top-0 left-0 w-full md:w-[50%] h-[300px] bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

        {/* Gradient overlays for contrast */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
      </div>

      <div className="container-eimah relative z-10 fade-up">
        <div className="max-w-3xl">
          <p className="text-brand-pink font-display font-medium text-sm md:text-base tracking-widest uppercase mb-4">
            (Featured Collection)
          </p>
          <h1 className="font-display font-bold text-[44px] leading-[1.05] md:text-[64px] lg:text-[76px] tracking-[-0.03em] text-white text-balance">
            Timeless Essentials <br className="hidden md:block" /> for every moment
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/80 leading-relaxed">
            We provide thoughtfully curated products and strategic business solutions designed to
            create lasting value.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 bg-brand-pink text-ink font-display font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-ink transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Shop Now
              <span className="grid place-items-center h-8 w-8 rounded-full bg-ink text-brand-pink group-hover:bg-ink group-hover:text-white transition-colors">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
            <Link
              to="/solutions"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-display font-semibold px-8 py-4 rounded-full hover:border-white hover:bg-white hover:text-ink transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              Explore Solutions <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Curated globally",
    "Delivered locally",
    "Trusted by businesses",
    "Made for you",
    "Retail · Procurement · Sourcing",
  ];

  return (
    <div className="relative overflow-hidden my-6 md:my-10 border-y border-border/60 py-4.5 bg-background z-10 select-none group">
      {/* Edge gradient masks for luxury continuous flow */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-28 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-28 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

      {/* Infinite Seamless Moving Track */}
      <div className="flex w-max marquee-track group-hover:[animation-play-state:paused]">
        {/* Set 1 */}
        <div className="flex shrink-0 items-center gap-12 font-display font-semibold text-xl md:text-2xl text-foreground/90 pr-12">
          {items.map((t) => (
            <span key={t} className="flex items-center gap-12 shrink-0">
              {t}
              <span className="inline-block h-2 w-2 rounded-full bg-brand-pink shrink-0" />
            </span>
          ))}
        </div>

        {/* Set 2 (Exact mirror clone for infinite seamless loop) */}
        <div
          className="flex shrink-0 items-center gap-12 font-display font-semibold text-xl md:text-2xl text-foreground/90 pr-12"
          aria-hidden="true"
        >
          {items.map((t, idx) => (
            <span key={`${t}-${idx}`} className="flex items-center gap-12 shrink-0">
              {t}
              <span className="inline-block h-2 w-2 rounded-full bg-brand-pink shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ValueProps() {
  const items = [
    {
      icon: Truck,
      t: "Fast nationwide delivery",
      d: "Lagos in 24–48h, nationwide in 3–5 days.",
      tint: "bg-brand-pink",
    },
    {
      icon: ShieldCheck,
      t: "Verified quality",
      d: "Every product inspected before it ships.",
      tint: "bg-brand-lime",
    },
    {
      icon: Gem,
      t: "Curated selection",
      d: "Intentionally chosen for quality, design, and lasting value.",
      tint: "bg-brand-yellow",
    },
    {
      icon: Briefcase,
      t: "Business procurement",
      d: "Sourcing & importation for teams of any size.",
      tint: "bg-brand-mint",
    },
  ];
  return (
    <section className="container-eimah py-12 md:py-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.t}
            className="group relative overflow-hidden rounded-xl border border-border bg-background p-5 hover:border-foreground transition-colors"
          >
            <div className={`h-10 w-10 rounded-lg ${it.tint} grid place-items-center`}>
              <it.icon className="size-4 text-ink" />
            </div>
            <h3 className="mt-4 font-display font-semibold text-base tracking-tight">{it.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{it.d}</p>
            <ArrowUpRight className="absolute top-5 right-5 size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-foreground transition" />
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedCategories() {
  const { data: categories = [], isLoading } = useCategoriesQuery();
  const activeCats = categories.filter((c: any) => c.active !== false);
  const featured = activeCats.filter((c: any) => c.featured);
  const displayCats =
    featured.length >= 3
      ? featured
      : [...featured, ...activeCats.filter((c: any) => !c.featured)].slice(
          0,
          Math.max(3, featured.length),
        );

  return (
    <section className="container-eimah py-10 md:py-16">
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
            Featured<span className="hidden md:inline"> Categories</span>
          </h2>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold border-b border-foreground pb-0.5 hover:text-brand-pink transition-colors"
        >
          Shop All <ArrowRight className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] md:aspect-[3/4] rounded-xl overflow-hidden bg-neutral-200 animate-pulse"
            />
          ))}
        </div>
      ) : displayCats.length === 0 ? null : (
        <div className="grid gap-4 md:grid-cols-3">
          {displayCats.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-xl bg-surface-2"
            >
              <img
                src={c.image}
                alt={c.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 text-white flex items-end justify-between">
                <div>
                  <h3 className="font-display font-semibold text-2xl md:text-3xl mt-1">{c.name}</h3>
                  <p className="text-sm opacity-80 mt-1">{c.blurb}</p>
                </div>
                <span className="grid place-items-center h-10 w-10 rounded-full bg-background text-foreground group-hover:bg-brand-pink transition-colors">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function FeaturedProductsSection() {
  const { data: allProducts = [], isLoading } = useProductsQuery();
  const activeProducts = allProducts.filter((p) => p.status === "Active");
  const featured = activeProducts.filter((p) => p.featured);
  const list = (featured.length > 0 ? featured : activeProducts).slice(0, 8);

  return (
    <section className="container-eimah py-16 md:py-13">
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
            <span className="hidden md:inline">Featured </span>Products
          </h2>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold border-b border-foreground pb-0.5 hover:text-brand-pink transition-colors"
        >
          Shop All <ArrowRight className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : list.length === 0 ? null : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      )}
    </section>
  );
}

function PromoBanner() {
  const { data: banners = [], isLoading } = useBannersQuery();
  const activeBanners = banners.filter((b) => b.status === "Active");
  const displayBanners = activeBanners.length > 0 ? activeBanners : [banners[0]].filter(Boolean);

  if (isLoading) {
    return (
      <section className="container-eimah py-7 md:py-10">
        <Skeleton className="h-72 w-full rounded-2xl bg-neutral-200" />
      </section>
    );
  }

  if (displayBanners.length === 0) return null;

  return (
    <section className="container-eimah py-7 md:py-10 space-y-6">
      {displayBanners.map((activeBanner) => {
        const targetUrl = getBannerTargetUrl(activeBanner.ctaTarget, activeBanner.ctaUrl);
        const isExternal = targetUrl.startsWith("http://") || targetUrl.startsWith("https://");

        return (
          <div
            key={activeBanner.id}
            className="relative overflow-hidden rounded-2xl bg-ink text-white p-8 md:p-14 grid md:grid-cols-2 gap-8 items-center shadow-xl"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-pink font-semibold">
                {activeBanner.eyebrow || "Seasonal Drop"}
              </p>
              <h3 className="mt-4 font-display font-bold text-4xl md:text-5xl tracking-tight text-balance">
                {activeBanner.title}
              </h3>
              <p className="mt-4 text-white/70 max-w-md">{activeBanner.supportingText}</p>
              {isExternal ? (
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 bg-brand-pink text-ink font-display font-semibold px-6 py-3 rounded-full hover:bg-white transition-colors"
                >
                  {activeBanner.ctaText || "Shop the edit"} <ArrowRight className="size-4" />
                </a>
              ) : (
                <Link
                  to={targetUrl}
                  className="mt-8 inline-flex items-center gap-2 bg-brand-pink text-ink font-display font-semibold px-6 py-3 rounded-full hover:bg-white transition-colors"
                >
                  {activeBanner.ctaText || "Shop the edit"} <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-lg bg-neutral-800">
              <img
                src={activeBanner.image}
                alt={activeBanner.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function BusinessSolutions() {
  const services = [
    {
      t: "Supplier Verification",
      d: "Vet manufacturers and vendors before you commit.",
      icon: Search,
      tint: "bg-brand-pink",
    },
    {
      t: "Procurement",
      d: "End-to-end purchasing managed by our team.",
      icon: Briefcase,
      tint: "bg-brand-lime",
    },
    {
      t: "Product Sourcing",
      d: "Find the right product at the right price, globally.",
      icon: Globe,
      tint: "bg-brand-yellow",
    },
    {
      t: "Importation",
      d: "Freight, clearance and last-mile — handled.",
      icon: Truck,
      tint: "bg-brand-mint",
    },
  ];
  return (
    <section className="bg-surface py-14 md:py-16">
      {/* ── Mobile: full-width banner card ── */}
      <div className="md:hidden">
        <div className="bg-ink text-white px-8 py-16 text-center">
          <p className="text-xs uppercase tracking-widest text-white/50 mb-4">EIMAH Solutions</p>
          <h2 className="font-display font-bold text-3xl leading-tight text-balance">
            Import & Global Trade Solutions
          </h2>
          <Link
            to="/solutions/business"
            className="mt-8 inline-flex items-center gap-2 bg-brand-lime text-ink font-display font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Explore Solutions <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* ── Desktop: full grid layout ── */}
      <div className="hidden md:grid container-eimah gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-balance">
            Import & Global Trade Solutions
          </h2>
          <p className="mt-5 text-muted-foreground max-w-md">
            From startups sourcing their first order to enterprises importing at scale — EIMAH
            Solutions is your dedicated commerce partner.
          </p>
          <Link
            to="/solutions/business"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold border-b border-foreground pb-0.5"
          >
            Explore Solutions <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
          {services.map((s) => (
            <div
              key={s.t}
              className="group relative overflow-hidden rounded-xl bg-background border border-border p-6 hover:border-foreground transition-colors"
            >
              <div className={`h-10 w-10 rounded-lg ${s.tint} grid place-items-center`}>
                <s.icon className="size-4 text-ink" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-xl tracking-tight">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              <ArrowUpRight className="absolute top-6 right-6 size-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-foreground transition-all" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LearningSolutions() {
  const programmes = [
    {
      icon: Ship,
      cohort: "Cohort · 04",
      title: "Importation Training",
      body: "Learn to import profitably — supplier vetting, freight, HS codes, clearance and cost control.",
      tint: "bg-brand-lime",
      duration: "6 weeks · Live cohort",
    },
    {
      icon: Package,
      cohort: "Cohort · 02",
      title: "Procurement Training",
      body: "Build a procurement function that saves you money — RFQs, contracts, vendor scorecards and SLAs.",
      tint: "bg-brand-mint",
      duration: "4 weeks · Live cohort",
    },
  ];
  return (
    <section className="py-8 md:py-12">
      {/* ── Mobile: full-width banner card ── */}
      <div className="md:hidden">
        <div className="bg-brand-lime text-ink px-8 py-16 text-center">
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-4">EIMAH Academy</p>
          <h2 className="font-display font-bold text-2xl leading-tight text-balance">
            Build the knowledge and skills to Navigate Global Trade Successfully.
          </h2>
          <Link
            to="/solutions/academy"
            className="mt-8 inline-flex items-center gap-2 bg-ink text-white font-display font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            View Training Programmes <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* ── Desktop: full layout ── */}
      <div className="hidden md:grid container-eimah gap-10 md:grid-cols-12 items-center">
        <div className="md:col-span-6 order-2 md:order-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="group relative rounded-xl overflow-hidden aspect-[4/3] sm:aspect-square bg-brand-lime p-6 md:p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold bg-white/30 backdrop-blur-sm w-max px-3 py-1.5 rounded-full">
              <span className="size-1.5 rounded-full bg-ink animate-pulse" /> Live Cohort
            </span>
            <div>
              <h3 className="font-display font-bold text-2xl md:text-3xl leading-tight">
                Importation Training
              </h3>
              <p className="text-sm mt-2 opacity-80">
                Learn to import profitably — from sourcing to clearance.
              </p>
            </div>
            <ArrowRight className="absolute bottom-6 right-6 md:bottom-8 md:right-8 size-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </div>
          <div className="group relative rounded-xl overflow-hidden aspect-[4/3] sm:aspect-square bg-brand-mint p-6 md:p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold bg-white/30 backdrop-blur-sm w-max px-3 py-1.5 rounded-full">
              <span className="size-1.5 rounded-full bg-ink animate-pulse" /> Live Cohort
            </span>
            <div>
              <h3 className="font-display font-bold text-2xl md:text-3xl leading-tight">
                Procurement Training
              </h3>
              <p className="text-sm mt-2 opacity-80">
                Build a procurement function that saves you money.
              </p>
            </div>
            <ArrowRight className="absolute bottom-6 right-6 md:bottom-8 md:right-8 size-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </div>
        </div>
        <div className="md:col-span-6 md:pl-8 order-1 md:order-2">
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-balance">
            Build the knowledge and skills to Navigate Global Trade Successfully.
          </h2>
          <p className="mt-5 text-muted-foreground max-w-md">
            Hands-on cohorts led by working buyers, importers, and category managers. Learn skills
            you'll use on day one.
          </p>
          <Link
            to="/solutions/academy"
            className="mt-8 hidden md:inline-flex items-center gap-2 text-sm font-semibold border-b border-foreground pb-0.5"
          >
            View Training Programmes <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container-eimah pb-6 md:pb-28">
      <div className="rounded-2xl bg-brand-pink text-ink p-10 md:p-16 text-center">
        <p className="text-xs uppercase tracking-widest">Ready to shop?</p>
        <h2 className="mt-4 font-display font-bold text-4xl md:text-6xl tracking-tight text-balance max-w-3xl mx-auto">
          Quality products, closer to you.
        </h2>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            to="/shop"
            className="bg-ink text-white font-display font-semibold px-6 py-3.5 rounded-full hover:bg-white hover:text-ink transition-colors inline-flex items-center gap-2"
          >
            Shop Now <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/solutions"
            className="border border-ink font-display font-semibold px-6 py-3.5 rounded-full hover:bg-ink hover:text-white transition-colors"
          >
            Explore Solutions
          </Link>
        </div>
      </div>
    </section>
  );
}
