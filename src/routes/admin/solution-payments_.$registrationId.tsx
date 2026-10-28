import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle2,
  ChevronRight,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import { StatusPill } from "@/components/admin/parts";
import { useSolutionPaymentsQuery, useUpdateSolutionPaymentStatusMutation, useSolutionsQuery } from "@/hooks/queries/useContentQuery";
import { type PaymentStatus } from "@/lib/admin-store";
import { formatNaira } from "@/lib/mock-data";
import { formatDateString } from "@/routes/admin/payments";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/admin/solution-payments_/$registrationId")({
  component: SolutionRegistrationDetailsPage,
});

function SolutionRegistrationDetailsPage() {
  const { registrationId } = Route.useParams();
  const nav = useNavigate();
  const { data: solutionPayments = [], isLoading } = useSolutionPaymentsQuery();
  const { data: solutions = [] } = useSolutionsQuery();
  const updateStatusMutation = useUpdateSolutionPaymentStatusMutation();

  const reg = solutionPayments.find(
    (sp) => sp.id === registrationId || sp.txnId === registrationId,
  );

  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus>("Successful");

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading registration details..." />
      </div>
    );
  }

  if (!reg) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-foreground">
          Registration Record Not Found
        </h2>
        <p className="text-muted-foreground text-xs">
          No solution registration record was found with ID{" "}
          <span className="font-mono">{registrationId}</span>.
        </p>
        <Link
          to="/admin/payments"
          className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Return to Payments
        </Link>
      </div>
    );
  }

  const solution = solutions.find(
    (s) => s.id === reg.solutionId || s.title.toLowerCase() === reg.solutionTitle.toLowerCase(),
  );

  const handleUpdateStatus = async () => {
    await updateStatusMutation.mutateAsync({ id: reg.id, status: selectedStatus });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        {/* <div className="flex items-center gap-3">
          <h2 className="font-display font-bold text-2xl text-foreground">
            Solution Registration Details
          </h2>
          <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-brand-pink/20 text-ink">
            {reg.category}
          </span>
        </div> */}

        <Link
          to="/admin/payments"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-white text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="size-4" /> Back to Payments
        </Link>
      </div>

      {/* ── Top Customer & Payment Hero Card ── */}
      <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-brand-pink/20 text-ink font-display font-bold text-xl grid place-items-center shrink-0 border border-brand-pink/40 shadow-xs">
              {reg.customerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-foreground">{reg.customerName}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5" /> {reg.customerEmail}
                </span>
                {reg.customerPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5" /> {reg.customerPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusPill value={reg.status} />
          </div>
        </div>

        {/* Payment Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface border border-border/60 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Amount Paid
            </span>
            <span className="font-display font-bold text-xl text-foreground">
              {formatNaira(reg.amount)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border/60 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Payment Method
            </span>
            <span className="font-semibold text-sm text-foreground flex items-center gap-1.5 pt-0.5">
              <CreditCard className="size-4 text-brand-pink" /> {reg.method}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border/60 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Txn Reference
            </span>
            <span className="font-mono font-semibold text-xs text-foreground block truncate pt-0.5">
              {reg.txnId}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border/60 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Registration Date
            </span>
            <span className="font-semibold text-sm text-muted-foreground flex items-center gap-1.5 pt-0.5">
              <Calendar className="size-4 text-muted-foreground" /> {formatDateString(reg.date)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Structured Details Layout ── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Solution Service & Registration Answers */}
        <div className="lg:col-span-8 space-y-6">
          {/* Service Info Banner */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Briefcase className="size-4 text-brand-pink" /> Solution Service Enrolled
            </h4>

            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between p-5 rounded-2xl bg-surface border border-border/60">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-ink text-white inline-block mb-1">
                  {reg.category} Service
                </span>
                <h3 className="font-display font-bold text-lg text-foreground">
                  {reg.solutionTitle}
                </h3>
                {solution && (
                  <p className="text-xs text-muted-foreground max-w-lg">{solution.description}</p>
                )}
              </div>

              {solution && (
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-muted-foreground block">
                    Service Regular Fee
                  </span>
                  <span className="font-bold text-base text-foreground">
                    {formatNaira(solution.discountPrice || solution.price)}
                  </span>
                  {solution.discountPrice && (
                    <span className="text-xs text-muted-foreground line-through block">
                      {formatNaira(solution.price)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Requirements & Submission Details */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-5">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <FileText className="size-4 text-brand-pink" /> Submitted Client Requirements
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              {reg.details.productTypes && (
                <div className="p-4 rounded-2xl border border-border/70 bg-surface/50 space-y-1">
                  <span className="text-muted-foreground text-[11px] font-semibold block uppercase tracking-wider">
                    Product Types / Category
                  </span>
                  <p className="font-bold text-sm text-foreground">{reg.details.productTypes}</p>
                </div>
              )}

              {reg.details.sourcingNeeds && (
                <div className="p-4 rounded-2xl border border-border/70 bg-surface/50 space-y-1">
                  <span className="text-muted-foreground text-[11px] font-semibold block uppercase tracking-wider">
                    Primary Sourcing Objective
                  </span>
                  <p className="font-bold text-sm text-foreground">{reg.details.sourcingNeeds}</p>
                </div>
              )}

              {reg.details.orderSize && (
                <div className="p-4 rounded-2xl border border-border/70 bg-surface/50 space-y-1">
                  <span className="text-muted-foreground text-[11px] font-semibold block uppercase tracking-wider">
                    Expected Order Volume
                  </span>
                  <p className="font-bold text-sm text-foreground">{reg.details.orderSize}</p>
                </div>
              )}

              {reg.details.hasSupplier && (
                <div className="p-4 rounded-2xl border border-border/70 bg-surface/50 space-y-1">
                  <span className="text-muted-foreground text-[11px] font-semibold block uppercase tracking-wider">
                    Current Supplier Status
                  </span>
                  <p className="font-bold text-sm text-foreground">{reg.details.hasSupplier}</p>
                </div>
              )}

              {reg.details.timeline && (
                <div className="p-4 rounded-2xl border border-border/70 bg-surface/50 space-y-1">
                  <span className="text-muted-foreground text-[11px] font-semibold block uppercase tracking-wider">
                    Target Timeline
                  </span>
                  <p className="font-bold text-sm text-foreground">{reg.details.timeline}</p>
                </div>
              )}

              {reg.details.businessName && (
                <div className="p-4 rounded-2xl border border-border/70 bg-surface/50 space-y-1">
                  <span className="text-muted-foreground text-[11px] font-semibold block uppercase tracking-wider">
                    Business / Brand Name
                  </span>
                  <p className="font-bold text-sm text-foreground">{reg.details.businessName}</p>
                </div>
              )}

              {reg.details.experienceLevel && (
                <div className="p-4 rounded-2xl border border-border/70 bg-surface/50 space-y-1">
                  <span className="text-muted-foreground text-[11px] font-semibold block uppercase tracking-wider">
                    Experience Level
                  </span>
                  <p className="font-bold text-sm text-foreground">{reg.details.experienceLevel}</p>
                </div>
              )}
            </div>

            {reg.details.learningGoals && (
              <div className="p-4 rounded-2xl border border-border/70 bg-surface/50 space-y-1.5">
                <span className="text-muted-foreground text-[11px] font-semibold block uppercase tracking-wider">
                  Learning Goals & Specific Topics
                </span>
                <p className="font-semibold text-sm text-foreground leading-relaxed">
                  {reg.details.learningGoals}
                </p>
              </div>
            )}

            {reg.details.additionalNotes && (
              <div className="p-4 rounded-2xl border border-border/70 bg-surface/50 space-y-1.5">
                <span className="text-muted-foreground text-[11px] font-semibold block uppercase tracking-wider">
                  Additional Notes & Specifications
                </span>
                <p className="font-medium text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {reg.details.additionalNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Updater & Admin Actions Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-5">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-3">
              Payment Status Control
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-2">
                  Update Payment Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as PaymentStatus)}
                  className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-semibold focus:border-foreground outline-none cursor-pointer"
                >
                  <option value="Successful">Successful</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                className="w-full h-11 rounded-xl bg-ink text-white font-semibold text-xs hover:bg-black transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="size-4 text-brand-pink" /> Save Status Update
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Registration Status</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This client registration was submitted via the storefront solution booking system. All
              entries are backed by real-time order history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
