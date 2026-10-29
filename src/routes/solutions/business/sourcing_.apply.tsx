import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import logoUrl from "@/assets/eimah-logo-white.svg";
import { Footer } from "@/components/site/Footer";
import { formatNaira } from "@/lib/mock-data";
import { useSolutionItemQuery } from "@/hooks/queries/useContentQuery";
import { useSolutionFlutterwaveCheckout } from "@/hooks/useSolutionFlutterwaveCheckout";
import { PaymentSuccessModal } from "@/components/site/PaymentSuccessModal";
import { BrandOverlayLoader } from "@/components/site/BrandOverlayLoader";

export const Route = createFileRoute("/solutions/business/sourcing_/apply")({
  component: SourcingApplyPage,
  head: () => ({
    meta: [
      { title: "Product Sourcing Application — EIMAH" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

export default function SourcingApplyPage() {
  const { solution } = useSolutionItemQuery("S-03");
  const { startFlutterwaveCheckout, isProcessing, isVerifying, successModalData, closeSuccessModal } =
    useSolutionFlutterwaveCheckout();

  const regularPrice = solution?.price ?? 20000;
  const hasDiscount = Boolean(solution?.discountPercent && solution.discountPercent > 0);
  const effectivePrice =
    hasDiscount && solution?.discountPrice ? solution.discountPrice : regularPrice;
  const discountPercent = solution?.discountPercent || 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    startFlutterwaveCheckout({
      solutionId: "S-03",
      solutionTitle: "Product Sourcing Consultation",
      solutionSlug: "business-sourcing",
      track: "Business",
      category: "Business",
      fullName: (data.get("fullName") as string) || "Applicant",
      email: (data.get("email") as string) || "",
      phone: (data.get("phone") as string) || "",
      businessName: (data.get("businessName") as string) || "",
      productCategory: (data.get("productCategory") as string) || "",
      sourcingNeed: (data.get("sourcingNeed") as string) || "",
      orderSize: (data.get("orderSize") as string) || "",
      supplierStatus: (data.get("supplierStatus") as string) || "",
      timeline: (data.get("timeline") as string) || "",
      additionalNotes: (data.get("additionalNotes") as string) || "",
      amount: effectivePrice,
    });
  };

  return (
    <div className="min-h-screen bg-[#3C3C44] text-white selection:bg-brand-pink selection:text-white pt-8">
      {/* ── Top Header ── */}
      <header className="px-4 mb-[30px]">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="flex justify-center">
            <Link to="/">
              <img
                src={logoUrl}
                alt="EIMAH"
                className="h-9 sm:h-10 w-auto mx-auto object-contain"
              />
            </Link>
          </div>
          <div>
            <h1 className="font-display font-medium text-base sm:text-lg text-white/90 tracking-tight">
              Book Your Consultation
            </h1>
          </div>
        </div>
      </header>

      {/* ── Main Form Container ── */}
      <main className="flex-1 container-eimah px-4 w-full">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background rounded-md p-6 sm:p-10 shadow-2xl border border-border text-foreground">
            <form onSubmit={handleSubmit}>
              <Section title="1. Sourcing Requirements" color="bg-brand-yellow">
                <Input label="Full Name *" name="fullName" required />
                <Input label="Business Name (Optional)" name="businessName" />
                <Input label="Email Address *" name="email" type="email" required />
                <Input label="Phone Number *" name="phone" type="tel" required />
                <Select
                  label="What type of products are you looking to source? *"
                  name="productCategory"
                  options={[
                    "Fashion & Apparel",
                    "Beauty & Personal Care",
                    "Home & Kitchen",
                    "Electronics & Accessories",
                    "Office & Stationery",
                    "Baby & Kids Products",
                    "Packaging & Business Supplies",
                    "Other",
                  ]}
                  required
                />
              </Section>

              <Section title="2. Sourcing Details" color="bg-brand-yellow">
                <Select
                  label="What best describes your sourcing needs? *"
                  name="sourcingNeed"
                  options={[
                    "Finding products for a new business",
                    "Expanding my existing product range",
                    "Finding new or alternative suppliers",
                    "Developing a private label/custom product",
                    "Bulk sourcing for business operations",
                    "Exploring product opportunities",
                  ]}
                  required
                />
                <Select
                  label="Expected Order Size *"
                  name="orderSize"
                  options={[
                    "Sample/Testing Quantity",
                    "Small Quantity",
                    "Medium Quantity",
                    "Bulk Order",
                    "Large Commercial Order",
                    "Not Sure Yet",
                  ]}
                  required
                />
                <Select
                  label="Do you currently have a supplier? *"
                  name="supplierStatus"
                  options={[
                    "Yes, I already have a supplier",
                    "No, I need help finding one",
                    "I am exploring supplier options",
                  ]}
                  required
                />
                <Select
                  label="Expected Timeline *"
                  name="timeline"
                  options={[
                    "Immediately",
                    "Within 1 month",
                    "Within 1–3 months",
                    "More than 3 months",
                    "Still exploring options",
                  ]}
                  required
                />
              </Section>

              <Section title="3. Additional Information (Optional)" color="bg-brand-yellow">
                <Textarea
                  label="Is there anything else you would like us to know before your consultation?"
                  name="additionalNotes"
                />
              </Section>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isProcessing || isVerifying}
                  className="w-full bg-black text-white font-semibold text-xs sm:text-sm py-3.5 px-4 rounded-md hover:bg-zinc-900 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 min-h-[48px]"
                >
                  {isProcessing ? (
                    <Loader2 className="size-5 animate-spin mx-auto text-current" />
                  ) : (
                    <>
                      <span>Pay {formatNaira(effectivePrice)}</span>
                      {hasDiscount && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white shrink-0">
                          Save {formatNaira(regularPrice - effectivePrice)}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

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

      {/* ── Footer ── */}
      <div className="[&>footer]:mt-8">
        <Footer />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-lg mb-4 text-ink flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full inline-block ${color}`} /> {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        className="w-full h-12 px-4 rounded-md border border-border bg-surface focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all disabled:opacity-50 text-foreground"
        {...props}
      />
    </div>
  );
}

function Select({ label, options, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
      <select
        className="w-full h-12 px-4 rounded-md border border-border bg-surface focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all appearance-none text-foreground"
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

function Textarea({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
      <textarea
        rows={4}
        className="w-full p-4 rounded-md border border-border bg-surface focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all resize-none text-foreground"
        {...props}
      />
    </div>
  );
}
