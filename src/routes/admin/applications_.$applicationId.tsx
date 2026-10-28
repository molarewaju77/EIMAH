import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Printer,
  Save,
  Building2,
  Package,
  CreditCard,
  FileText,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { StatusPill, SectionCard } from "@/components/admin/parts";
import {
  useApplicationDetailQuery,
  useUpdateApplicationStatusMutation,
  useUpdateApplicationPaymentStatusMutation,
  useUpdateApplicationNotesMutation,
} from "@/hooks/queries/useSolutionSubmissionsQuery";
import { type SolutionStatus, type PaymentStatus } from "@/lib/solution-data";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/admin/applications_/$applicationId")({
  component: ApplicationDetailsPage,
  head: () => ({
    meta: [{ title: "Application Details — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const STATUSES: SolutionStatus[] = ["Pending", "In Progress", "Completed"];
const PAYMENT_STATUSES: PaymentStatus[] = ["Pending", "Successful", "Failed", "Refunded"];

function formatFullDate(iso?: string) {
  if (!iso) return "N/A";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ApplicationDetailsPage() {
  const { applicationId } = Route.useParams();
  const { data: application, isLoading } = useApplicationDetailQuery(applicationId);
  const statusMutation = useUpdateApplicationStatusMutation();
  const paymentStatusMutation = useUpdateApplicationPaymentStatusMutation();
  const notesMutation = useUpdateApplicationNotesMutation();

  const [status, setStatus] = useState<SolutionStatus>("Pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Successful");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (application) {
      setStatus(application.status);
      const initialPayStatus =
        (application.paymentStatus as string) === "Paid"
          ? "Successful"
          : application.paymentStatus || "Pending";
      setPaymentStatus(initialPayStatus as PaymentStatus);
      setNotes(application.internalNotes || "");
    }
  }, [application]);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading application details..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="py-16 text-center space-y-4 px-4">
        <h2 className="text-xl font-semibold font-display text-foreground">
          Application Not Found
        </h2>
        <p className="text-muted-foreground text-xs">
          No application was found with ID <span className="font-mono">{applicationId}</span>.
        </p>
        <Link
          to="/admin/applications"
          className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Return to Applications
        </Link>
      </div>
    );
  }

  const isSaving =
    statusMutation.isPending || paymentStatusMutation.isPending || notesMutation.isPending;

  const handleSaveChanges = async () => {
    try {
      let hasChanges = false;
      if (status !== application.status) {
        await statusMutation.mutateAsync({ id: application.id, status });
        hasChanges = true;
      }
      if (paymentStatus !== application.paymentStatus) {
        await paymentStatusMutation.mutateAsync({ id: application.id, paymentStatus });
        hasChanges = true;
      }
      if (notes !== (application.internalNotes || "")) {
        await notesMutation.mutateAsync({ id: application.id, internalNotes: notes });
        hasChanges = true;
      }
      if (!hasChanges) {
        toast.info("No changes to save.");
      }
    } catch {
      // handled in mutations
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const initials =
    application.fullName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AP";

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 text-foreground pt-2 sm:pt-1 print:p-0">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 print:hidden">
        <Link
          to="/admin/applications"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-border bg-white text-xs font-semibold text-foreground hover:bg-ink hover:text-white transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="size-3.5" /> Back to Applications
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-2xs border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="size-12 sm:size-14 rounded-full bg-brand-pink text-ink font-bold text-sm sm:text-base grid place-items-center shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center justify-between sm:justify-start gap-2.5 flex-wrap">
                <h1 className="font-display font-bold text-lg sm:text-xl text-foreground break-words">
                  {application.fullName}
                </h1>
                <StatusPill status={application.status} />
              </div>
              <div className="space-y-1 text-xs text-muted-foreground font-normal">
                <p>
                  ID :{" "}
                  <span className="font-mono font-medium text-foreground">{application.id}</span>
                </p>
                <p>
                  Service :{" "}
                  <span className="font-medium text-foreground">{application.solutionTitle}</span>
                </p>
                <p>
                  Track :{" "}
                  <span className="font-medium text-foreground">{application.track} Track</span>
                </p>
                <p>
                  Submitted on :{" "}
                  <span className="font-medium text-foreground">
                    {formatFullDate(application.date)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
            <p className="text-xs text-muted-foreground font-medium">Consultation Fee</p>
            <p className="font-display font-bold text-xl text-foreground">
              {formatNaira(application.amount)}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column (Details Cards) */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* Card 1: Personal Information */}
          <SectionCard title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  FIRST NAME
                </span>
                <span className="text-[14px] font-[500] text-foreground break-words block">
                  {application.fullName.split(" ")[0] || application.fullName}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  LAST NAME
                </span>
                <span className="text-[14px] font-[500] text-foreground break-words block">
                  {application.fullName.split(" ").slice(1).join(" ") || "-"}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  EMAIL ADDRESS
                </span>
                <span className="text-[14px] font-[500] text-foreground break-all block">
                  {application.email}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  PHONE NUMBER
                </span>
                <span className="text-[14px] font-[500] text-foreground block">
                  {application.phone}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  LOCATION / CITY
                </span>
                <span className="text-[14px] font-[500] text-foreground block">
                  {application.location || "Not specified"}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  BUSINESS NAME
                </span>
                <span className="text-[14px] font-[500] text-foreground break-words block">
                  {application.businessName || "Not provided"}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  HAS EXISTING BUSINESS
                </span>
                <span className="text-[14px] font-[500] text-foreground block">
                  {application.hasBusiness || (application.businessName ? "Yes" : "No")}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Card 2: Application / Service Requirements */}
          <SectionCard title="Application Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div className="sm:col-span-2">
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  APPLIED PROGRAM / SERVICE
                </span>
                <span className="text-[14px] font-[500] text-foreground block">
                  {application.solutionTitle}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  TRACK
                </span>
                <span className="text-[14px] font-[500] text-foreground block">
                  {application.track} Track
                </span>
              </div>

              {application.productCategory && (
                <div>
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    PRODUCT CATEGORY
                  </span>
                  <span className="text-[14px] font-[500] text-foreground block">
                    {application.productCategory}
                  </span>
                </div>
              )}

              {application.sourcingNeed && (
                <div className="sm:col-span-2">
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    SOURCING NEED / OBJECTIVE
                  </span>
                  <span className="text-[14px] font-[500] text-foreground block leading-relaxed">
                    {application.sourcingNeed}
                  </span>
                </div>
              )}

              {application.orderSize && (
                <div>
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    EXPECTED ORDER SIZE
                  </span>
                  <span className="text-[14px] font-[500] text-foreground block">
                    {application.orderSize}
                  </span>
                </div>
              )}

              {application.budget && (
                <div>
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    ESTIMATED BUDGET
                  </span>
                  <span className="text-[14px] font-[500] text-foreground block">
                    {application.budget}
                  </span>
                </div>
              )}

              {application.supplierStatus && (
                <div>
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    SUPPLIER STATUS
                  </span>
                  <span className="text-[14px] font-[500] text-foreground block">
                    {application.supplierStatus}
                  </span>
                </div>
              )}

              {application.supplierName && (
                <div>
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    SUPPLIER NAME
                  </span>
                  <span className="text-[14px] font-[500] text-foreground block">
                    {application.supplierName}
                  </span>
                </div>
              )}

              {application.supplierWebsite && (
                <div className="sm:col-span-2">
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    SUPPLIER WEBSITE / STORE LINK
                  </span>
                  <a
                    href={
                      application.supplierWebsite.startsWith("http")
                        ? application.supplierWebsite
                        : `https://${application.supplierWebsite}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] font-[500] text-foreground inline-flex items-center gap-1.5 break-all underline"
                  >
                    <span>{application.supplierWebsite}</span>
                    <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
                  </a>
                </div>
              )}

              {application.negotiationSupport && (
                <div>
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    NEGOTIATION SUPPORT REQUIRED
                  </span>
                  <span className="text-[14px] font-[500] text-foreground block">
                    {application.negotiationSupport}
                  </span>
                </div>
              )}

              {application.timeline && (
                <div>
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    EXPECTED TIMELINE
                  </span>
                  <span className="text-[14px] font-[500] text-foreground block">
                    {application.timeline}
                  </span>
                </div>
              )}

              {application.experienceLevel && (
                <div className="sm:col-span-2">
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    CURRENT EXPERIENCE LEVEL
                  </span>
                  <span className="text-[14px] font-[500] text-foreground block leading-relaxed">
                    {application.experienceLevel}
                  </span>
                </div>
              )}

              {application.mainGoal && (
                <div className="sm:col-span-2">
                  <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                    MAIN TRAINING GOAL / OBJECTIVE
                  </span>
                  <span className="text-[14px] font-[500] text-foreground block leading-relaxed">
                    {application.mainGoal}
                  </span>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Card 3: Additional Notes & Customer Challenges */}
          {application.additionalNotes && (
            <SectionCard title="Additional Notes & Requirements">
              <div className="p-4 rounded-xl bg-surface border border-border text-[14px] font-[500] text-foreground leading-relaxed whitespace-pre-wrap">
                {application.additionalNotes}
              </div>
            </SectionCard>
          )}

          {/* Card 4: Payment Details */}
          <SectionCard title="Payment Information">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  AMOUNT PAID
                </span>
                <span className="text-[14px] font-[500] text-foreground block">
                  {formatNaira(application.amount)}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  PAYMENT STATUS
                </span>
                <div className="mt-0.5">
                  <StatusPill status={paymentStatus} />
                </div>
              </div>

              <div>
                <span className="text-[12px] font-[600] text-muted-foreground block mb-1">
                  DATE & TIME
                </span>
                <span className="text-[14px] font-[500] text-foreground block">
                  {formatFullDate(application.date)}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column (Sidebar Cards matching Screenshot 1 reference) */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6">
          {/* CURRENT STATUS Sidebar Card */}
          <SectionCard>
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  CURRENT STATUS
                </span>
                <StatusPill status={status} />
              </div>

              <div className="space-y-2 pt-1 border-t border-border/60">
                <label className="block text-xs font-semibold text-foreground">Change application status</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SolutionStatus)}
                    className="w-full h-11 px-3.5 pr-8 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:outline-none focus:border-foreground shadow-2xs cursor-pointer appearance-none"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-border/60">
                <label className="block text-xs font-semibold text-foreground">Change payment status</label>
                <div className="relative">
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full h-11 px-3.5 pr-8 rounded-xl border border-border bg-white text-sm font-medium text-foreground focus:outline-none focus:border-foreground shadow-2xs cursor-pointer appearance-none"
                  >
                    {PAYMENT_STATUSES.map((ps) => (
                      <option key={ps} value={ps}>
                        {ps}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-border/60">
                <label className="block text-xs font-semibold text-foreground">
                  Reviewer notes
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record interview feedback, verification outcomes or next steps."
                  className="w-full p-3.5 rounded-xl border border-border bg-white text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-foreground transition-all resize-y"
                />
              </div>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveChanges}
                className="w-full h-11 rounded-xl bg-ink text-white hover:bg-black font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="size-4" />
                <span>{isSaving ? "Saving..." : "Save changes"}</span>
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
