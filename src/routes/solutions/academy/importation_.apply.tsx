import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import logoUrl from "@/assets/eimah-logo-white.svg";
import { formatNaira } from "@/lib/mock-data";
import { useSolutionItemQuery } from "@/hooks/queries/useContentQuery";
import { useSolutionFlutterwaveCheckout } from "@/hooks/useSolutionFlutterwaveCheckout";
import { PaymentSuccessModal } from "@/components/site/PaymentSuccessModal";
import { BrandOverlayLoader } from "@/components/site/BrandOverlayLoader";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/solutions/academy/importation_/apply")({
  component: AcademyImportationApplyPage,
  head: () => ({
    meta: [
      { title: "Register for Importation Training — EIMAH Academy" },
      {
        name: "description",
        content: "Register for China Importation Training with EIMAH Academy.",
      },
    ],
  }),
});

function AcademyImportationApplyPage() {
  const { solution } = useSolutionItemQuery("S-05");
  const { startFlutterwaveCheckout, isProcessing, isVerifying, successModalData, closeSuccessModal } =
    useSolutionFlutterwaveCheckout();

  const regularPrice = solution?.price ?? 40000;
  const hasDiscount = Boolean(solution?.discountPercent && solution.discountPercent > 0);
  const effectivePrice =
    hasDiscount && solution?.discountPrice ? solution.discountPrice : regularPrice;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    startFlutterwaveCheckout({
      solutionId: "S-05",
      solutionTitle: "China Importation Training",
      solutionSlug: "academy-importation",
      track: "Academy",
      category: "Learning",
      fullName: (data.get("fullName") as string) || "Applicant",
      email: (data.get("email") as string) || "",
      phone: (data.get("phone") as string) || "",
      location: (data.get("location") as string) || "",
      hasBusiness: (data.get("hasBusiness") as string) || "",
      businessName: (data.get("businessName") as string) || "",
      experienceLevel: (data.get("experienceLevel") as string) || "",
      mainGoal: (data.get("mainGoal") as string) || "",
      timeline: (data.get("timeline") as string) || "",
      amount: effectivePrice,
    });
  };

  return (
    <div className="min-h-screen bg-[#3C3C44] text-white pt-8">
      {/* ── Header ── */}
      <header className="px-4 mb-[30px]">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <Link to="/" className="inline-block">
            <img
              src={logoUrl}
              alt="EIMAH Logo"
              className="h-9 sm:h-10 mx-auto object-contain"
            />
          </Link>
          <h1 className="text-base sm:text-lg font-medium text-white/90">
            Register for Training
          </h1>
        </div>
      </header>

      {/* ── Form Container ── */}
      <div className="container-eimah max-w-2xl mx-auto px-4 w-full">
        <div className="bg-background text-foreground border border-border rounded-md p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Section title="1. Personal Information" color="bg-brand-lime">
              <Input label="Full Name *" name="fullName" required />
              <Input label="Email Address *" name="email" type="email" required />
              <Input label="Phone Number *" name="phone" type="tel" required />
              <Input label="Location *" name="location" required />
            </Section>

            <Section title="2. Business Information" color="bg-brand-lime">
              <Select label="Do you currently operate a business?" name="hasBusiness" options={["Yes", "No"]} />
              <Input label="Business Name (Optional)" name="businessName" />
            </Section>

            <Section title="3. Experience & Goals" color="bg-brand-lime">
              <Select
                label="What is your current importation experience?"
                name="experienceLevel"
                options={[
                  "Complete Beginner — Never imported before",
                  "Novice — Bought a few items, want to learn proper process",
                  "Intermediate — Operating a business, want to scale imports",
                  "Experienced — Looking to optimize sourcing & freight costs",
                ]}
                required
              />
              <Select
                label="What is your main goal for taking this training?"
                name="mainGoal"
                options={[
                  "Start an importation business in Nigeria",
                  "Source products directly for my existing retail/e-commerce store",
                  "Cut out middlemen and deal with 1688 / Taobao / suppliers directly",
                  "Learn sea & air freight shipping, logistics & clearance procedures",
                  "Master safe RMB payment methods & supplier verification",
                ]}
                required
              />
              <Select
                label="Preferred Start Timeline"
                name="timeline"
                options={["As soon as possible", "Within 1 month", "Within 1–3 months", "Still planning"]}
                required
              />
            </Section>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing || isVerifying}
                className="w-full bg-black text-white hover:bg-zinc-800 font-semibold text-sm sm:text-base py-3.5 px-6 rounded-md transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 min-h-[48px]"
              >
                {isProcessing ? (
                  <span>Redirecting to payment...</span>
                ) : (
                  <span>Pay {formatNaira(effectivePrice)}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="[&>footer]:mt-8">
        <Footer />
      </div>

      {/* Brand Loader overlay while creating order & redirecting to Flutterwave */}
      <BrandOverlayLoader
        show={isProcessing}
        mode="fixed"
        label="Redirecting to secure payment..."
      />

      {/* Brand Loader overlay while verifying payment */}
      <BrandOverlayLoader
        show={isVerifying}
        mode="fixed"
        label="Verifying payment..."
      />

      {/* Payment Success Modal */}
      <PaymentSuccessModal data={successModalData} onClose={closeSuccessModal} />
    </div>
  );
}

function Section({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full inline-block ${color}`} /> {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        className="w-full h-11 px-4 rounded-md border border-input bg-background focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all text-sm text-foreground disabled:opacity-50"
        {...props}
      />
    </div>
  );
}

function Select({ label, options, ...props }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <select
        className="w-full h-11 px-4 rounded-md border border-input bg-background focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all text-sm text-foreground appearance-none"
        {...props}
      >
        <option value="" disabled selected>
          Select an option
        </option>
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
