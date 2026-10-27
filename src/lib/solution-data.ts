export type SolutionTrack = "Business" | "Academy";

export type SolutionStatus = "Pending" | "In Progress" | "Completed";

export type PaymentStatus = "Pending" | "Successful" | "Failed" | "Refunded";

export type SolutionSubmission = {
  id: string;
  track: SolutionTrack;
  solutionTitle: string;
  solutionSlug: string;
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  businessName?: string;
  hasBusiness?: string;
  productCategory?: string;
  sourcingNeed?: string;
  orderSize?: string;
  budget?: string;
  supplierStatus?: string;
  supplierName?: string;
  supplierWebsite?: string;
  negotiationSupport?: string;
  experienceLevel?: string;
  mainGoal?: string;
  timeline?: string;
  additionalNotes?: string;
  amount: number;
  paymentStatus: PaymentStatus;
  status: SolutionStatus;
  date: string;
  internalNotes?: string;
};

export const SOLUTIONS_LIST = [
  "Product Sourcing Consultation",
  "China Importation Training",
  "Procurement Masterclass",
  "Procurement Advisory Consultation",
  "Importation Advisory Consultation",
];
