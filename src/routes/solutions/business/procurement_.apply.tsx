import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import logoUrl from "@/assets/eimah-logo-white.svg";
import { formatNaira } from "@/lib/mock-data";
import { useSolutionItemQuery } from "@/hooks/queries/useContentQuery";
import { useSolutionFlutterwaveCheckout } from "@/hooks/useSolutionFlutterwaveCheckout";
import { PaymentSuccessModal } from "@/components/site/PaymentSuccessModal";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/solutions/business/procurement_/apply")({
  component: BusinessProcurementApplyPage,
  head: () => ({
    meta: [
      { title: "Book Procurement Consultation — EIMAH" },
      {
        name: "description",
        content: "Book your Procurement Advisory Consultation with EIMAH.",
      },
    ],
  }),
});

function BusinessProcurementApplyPage() {
  const { solution } = useSolutionItemQuery("S-02");
  const { startFlutterwaveCheckout, isProcessing, isVerifying, successModalData, closeSuccessModal } =
    useSolutionFlutterwaveCheckout();

  const regularPrice = solution?.price ?? 45000;
  const hasDiscount = Boolean(solution?.discountPercent && solution.discountPercent > 0);
  const effectivePrice =
    hasDiscount && solution?.discountPrice ? solution.discountPrice : regularPrice;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    startFlutterwaveCheckout({
      solutionId: "S-02",
      solutionTitle: "Procurement Advisory Consultation",
      solutionSlug: "business-procurement",
      track: "Business",
      category: "Business",
      fullName: (data.get("fullName") as string) || "Applicant",
      email: (data.get("email") as string) || "",
      phone: (data.get("phone") as string) || "",
      businessName: (data.get("businessName") as string) || "",
      productCategory: (data.get("productCategory") as string) || "",
      supplierStatus: (data.get("supplierStatus") as string) || "",
      supplierName: (data.get("supplierName") as string) || "",
      supplierWebsite: (data.get("supplierWebsite") as string) || "",
      orderSize: (data.get("orderSize") as string) || "",
      budget: (data.get("budget") as string) || "",
      negotiationSupport: (data.get("negotiationSupport") as string) || "",
      timeline: (data.get("timeline") as string) || "",
      additionalNotes: (data.get("additionalNotes") as string) || "",
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
            Book Your Consultation
          </h1>
        </div>
      </header>

      {/* ── Form Container ── */}
      <div className="container-eimah max-w-2xl mx-auto px-4 w-full">
        <div className="bg-background text-foreground border border-border rounded-md p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Section title="1. Procurement Requirements" color="bg-brand-mint">
              <Input label="Full Name *" name="fullName" required />
              <Input label="Business Name (Optional)" name="businessName" />
              <Input label="Email Address *" name="email" type="email" required />
              <Input label="Phone Number *" name="phone" type="tel" required />
              <Select
                label="What type of products are you looking to procure? *"
                name="productCategory"
                options={[
                  "Fashion & Apparel",
                  "Beauty & Personal Care",
                  "Home & Kitchen",
                  "Electronics & Accessories",
                  "Office & Stationery",
                  "Baby & Kids Products",
                  "Health & Wellness",
                  "Packaging & Business Supplies",
                  "General Merchandise",
                  "Other",
                ]}
                required
              />
            </Section>

            <Section title="2. Supplier & Quantity details" color="bg-brand-mint">
              <Select
                label="Have you identified a supplier? *"
                name="supplierStatus"
                options={[
                  "Yes, I already have a supplier",
                  "No, I need assistance finding a supplier",
                  "I have multiple supplier options and need support evaluating them",
                ]}
                required
              />
              <Input label="Supplier Name (Optional)" name="supplierName" />
              <Input label="Supplier Website / Store Link (Optional)" name="supplierWebsite" />
              <Select
                label="Expected Order Size *"
                name="orderSize"
                options={[
                  "Sample Order",
                  "Small Quantity",
                  "Medium Quantity",
                  "Bulk Order",
                  "Large Commercial Order",
                  "Not Sure Yet",
                ]}
                required
              />
              <Select
                label="Estimated Budget *"
                name="budget"
                options={[
                  "Below ₦500,000",
                  "₦500,000 – ₦2,000,000",
                  "₦2,000,000 – ₦5,000,000",
                  "Above ₦5,000,000",
                  "Still Determining",
                ]}
                required
              />
              <Select
                label="Do you require supplier negotiation support? *"
                name="negotiationSupport"
                options={[
                  "Yes, I need assistance negotiating pricing and terms",
                  "No, I already have agreed terms with the supplier",
                  "Not sure, I need guidance",
                ]}
                required
              />
              <Select
                label="Expected Purchase Timeline *"
                name="timeline"
                options={[
                  "Immediately",
                  "Within 30 days",
                  "Within 1–3 months",
                  "More than 3 months",
                  "Still planning",
                ]}
                required
              />
            </Section>

            <Section title="3. Additional Information (Optional)" color="bg-brand-mint">
              <Textarea label="Tell us about your project or specific challenges." name="additionalNotes" />
            </Section>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-black text-white hover:bg-zinc-800 font-semibold text-sm sm:text-base py-3.5 px-6 rounded-md transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 min-h-[48px]"
              >
                {isProcessing ? (
                  <Loader2 className="size-5 animate-spin mx-auto text-current" />
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

      {/* Verification Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-background border border-border rounded-md p-6 shadow-2xl flex items-center gap-4 text-foreground font-medium animate-in zoom-in-95">
            <Loader2 className="size-6 animate-spin text-emerald-500 shrink-0" />
            <span>Confirming your payment...</span>
          </div>
        </div>
      )}

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

function Textarea({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <textarea
        className="w-full p-4 rounded-md border border-input bg-background focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all text-sm text-foreground resize-none h-28"
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
