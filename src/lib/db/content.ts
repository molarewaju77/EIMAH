import { supabase } from "../supabase";
import {
  type Banner,
  type Popup,
  type Solution,
  type SolutionPayment,
  type Transaction,
} from "../admin-data";
import { type SolutionSubmission, type SolutionStatus, type PaymentStatus } from "../solution-data";
import type { PickupStation } from "../admin-store";

export type { Transaction };


// ── BANNERS ─────────────────────────────────────────────────
function rowToBanner(r: Record<string, unknown>): Banner {
  return {
    id: r.id as string,
    eyebrow: (r.eyebrow as string) ?? "",
    title: r.title as string,
    supportingText: r.supporting_text as string,
    ctaText: r.cta_text as string,
    ctaTarget: (r.cta_target as Banner["ctaTarget"]) ?? "shop",
    ctaUrl: (r.cta_url as string) ?? "/shop",
    image: r.image as string,
    status: (r.status as Banner["status"]) ?? "Draft",
    startDate: (r.start_date as string) ?? "",
    endDate: (r.end_date as string) ?? "",
  };
}

export async function fetchBanners(): Promise<Banner[]> {
  try {
    const { data, error } = await supabase.from("banners").select("*").order("created_at");
    if (error) throw error;
    if (!data || data.length === 0) return [];
    return data.map(rowToBanner);
  } catch (err) {
    console.warn("Failed to fetch banners from Supabase:", err);
    return [];
  }
}

export async function insertBanner(b: Banner): Promise<void> {
  const { error } = await supabase.from("banners").insert({
    id: b.id,
    eyebrow: b.eyebrow,
    title: b.title,
    supporting_text: b.supportingText,
    cta_text: b.ctaText,
    cta_target: b.ctaTarget ?? "shop",
    cta_url: b.ctaUrl ?? "/shop",
    image: b.image,
    status: b.status,
    start_date: b.startDate || null,
    end_date: b.endDate || null,
  });
  if (error) throw error;
}

export async function updateBanner(id: string, patch: Partial<Banner>): Promise<void> {
  const u: Record<string, unknown> = {};
  if (patch.eyebrow !== undefined) u.eyebrow = patch.eyebrow;
  if (patch.title !== undefined) u.title = patch.title;
  if (patch.supportingText !== undefined) u.supporting_text = patch.supportingText;
  if (patch.ctaText !== undefined) u.cta_text = patch.ctaText;
  if (patch.ctaTarget !== undefined) u.cta_target = patch.ctaTarget;
  if (patch.ctaUrl !== undefined) u.cta_url = patch.ctaUrl;
  if (patch.image !== undefined) u.image = patch.image;
  if (patch.status !== undefined) u.status = patch.status;
  if (patch.startDate !== undefined) u.start_date = patch.startDate || null;
  if (patch.endDate !== undefined) u.end_date = patch.endDate || null;
  const { error } = await supabase.from("banners").update(u).eq("id", id);
  if (error) throw error;
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw error;
}

// ── POPUPS ──────────────────────────────────────────────────
function rowToPopup(r: Record<string, unknown>): Popup {
  return {
    id: r.id as string,
    title: r.title as string,
    body: r.body as string,
    ctaText: r.cta_text as string,
    ctaTarget: (r.cta_target as Popup["ctaTarget"]) ?? "solutions",
    ctaUrl: (r.cta_url as string) ?? "/solutions",
    status: (r.status as Popup["status"]) ?? "Draft",
  };
}

export async function fetchPopups(): Promise<Popup[]> {
  try {
    const { data, error } = await supabase.from("popups").select("*").order("created_at");
    if (error) throw error;
    if (!data || data.length === 0) return [];
    return data.map(rowToPopup);
  } catch (err) {
    console.warn("Failed to fetch popups from Supabase:", err);
    return [];
  }
}

export async function insertPopup(p: Popup): Promise<void> {
  const { error } = await supabase.from("popups").insert({
    id: p.id,
    title: p.title,
    body: p.body,
    cta_text: p.ctaText,
    cta_target: p.ctaTarget ?? "shop",
    cta_url: p.ctaUrl ?? "/shop",
    status: p.status,
  });
  if (error) throw error;
}

export async function updatePopup(id: string, patch: Partial<Popup>): Promise<void> {
  const u: Record<string, unknown> = {};
  if (patch.title !== undefined) u.title = patch.title;
  if (patch.body !== undefined) u.body = patch.body;
  if (patch.ctaText !== undefined) u.cta_text = patch.ctaText;
  if (patch.ctaTarget !== undefined) u.cta_target = patch.ctaTarget;
  if (patch.ctaUrl !== undefined) u.cta_url = patch.ctaUrl;
  if (patch.status !== undefined) u.status = patch.status;

  const { error } = await supabase.from("popups").update(u).eq("id", id);
  if (error) throw error;
}

export async function deletePopup(id: string): Promise<void> {
  const { error } = await supabase.from("popups").delete().eq("id", id);
  if (error) throw error;
}

// ── SOLUTIONS ───────────────────────────────────────────────
function rowToSolution(r: Record<string, unknown>): Solution {
  return {
    id: r.id as string,
    category: r.category as Solution["category"],
    title: r.title as string,
    description: r.description as string,
    image: (r.image as string) ?? undefined,
    price: Number(r.price ?? 0),
    discountPercent: r.discount_percent ? Number(r.discount_percent) : undefined,
    discountPrice: r.discount_price ? Number(r.discount_price) : undefined,
    visible: r.visible !== false,
  };
}


export async function fetchSolutions(): Promise<Solution[]> {
  try {
    const { data, error } = await supabase.from("solutions").select("*").order("category");
    if (error) throw error;
    if (!data || data.length === 0) return [];
    return data.map(rowToSolution);
  } catch (err) {
    console.warn("Failed to fetch solutions from Supabase:", err);
    return [];
  }
}

export async function updateSolutionDB(id: string, patch: Partial<Solution>): Promise<void> {
  const u: Record<string, unknown> = {};
  if (patch.price !== undefined) u.price = patch.price;
  if (patch.discountPercent !== undefined) u.discount_percent = patch.discountPercent ?? null;
  if (patch.discountPrice !== undefined) u.discount_price = patch.discountPrice ?? null;
  if (patch.visible !== undefined) u.visible = patch.visible;
  const { error } = await supabase.from("solutions").update(u).eq("id", id);
  if (error) throw error;
}

// ── SOLUTION PAYMENTS ───────────────────────────────────────
function rowToSolutionPayment(r: Record<string, unknown>): SolutionPayment {
  return {
    id: r.id as string,
    txnId: r.txn_id as string,
    solutionId: (r.solution_id as string) ?? "",
    solutionTitle: r.solution_title as string,
    category: r.category as SolutionPayment["category"],
    customerName: r.customer_name as string,
    customerEmail: r.customer_email as string,
    customerPhone: (r.customer_phone as string) ?? undefined,
    amount: Number(r.amount),
    method: r.method as SolutionPayment["method"],
    status: r.status as SolutionPayment["status"],
    date: r.date as string,
    details: {
      productTypes: (r.product_types as string) ?? undefined,
      sourcingNeeds: (r.sourcing_needs as string) ?? undefined,
      orderSize: (r.order_size as string) ?? undefined,
      hasSupplier: (r.has_supplier as string) ?? undefined,
      timeline: (r.timeline as string) ?? undefined,
      businessName: (r.business_name as string) ?? undefined,
      experienceLevel: (r.experience_level as string) ?? undefined,
      learningGoals: (r.learning_goals as string) ?? undefined,
      additionalNotes: (r.additional_notes as string) ?? undefined,
    },
  };
}

export type SolutionPaymentQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
};

export type PaginatedSolutionPaymentsResult = {
  solutionPayments: SolutionPayment[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function fetchPaginatedSolutionPayments(
  params: SolutionPaymentQueryParams = {},
): Promise<PaginatedSolutionPaymentsResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from("solution_payments")
      .select("*", { count: "exact" })
      .order("date", { ascending: false });

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    if (params.category && params.category !== "all") {
      query = query.eq("category", params.category);
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      query = query.or(
        `id.ilike.%${s}%,txn_id.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%,solution_title.ilike.%${s}%`,
      );
    }

    if (params.fromDate) {
      query = query.gte("date", params.fromDate);
    }

    if (params.toDate) {
      query = query.lte("date", `${params.toDate}T23:59:59.999Z`);
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map(rowToSolutionPayment);
    const total = count ?? mapped.length;

    return {
      solutionPayments: mapped,
      totalCount: total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (err) {
    console.error("Failed to fetch paginated solution payments from Supabase:", err);
    return {
      solutionPayments: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function fetchSolutionPayments(): Promise<SolutionPayment[]> {
  try {
    const { data, error } = await supabase
      .from("solution_payments")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToSolutionPayment);
  } catch (err) {
    console.error("Error fetching solution payments from Supabase:", err);
    return [];
  }
}

export async function updateSolutionPaymentStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from("solution_payments").update({ status }).eq("id", id);
  if (error) throw error;
}

// ── SOLUTION APPLICATIONS (SUPABASE DB) ──────────────────────
function rowToSolutionApplication(r: Record<string, unknown>): SolutionSubmission {
  const details = (r.details as Record<string, unknown>) || {};
  const category = (r.category as string) === "Learning" ? "Learning" : "Business";
  const track = category === "Learning" ? "Academy" : "Business";
  const dateStr = (r.created_at as string) || (r.date as string) || new Date().toISOString();

  return {
    id: r.id as string,
    solutionTitle: (r.solution_title as string) || "Solution Consultation",
    solutionSlug: (details.solutionSlug as string) || "solutions",
    track,
    fullName: r.full_name as string,
    email: r.email as string,
    phone: (r.phone as string) || "",
    location: (details.location as string) || "",
    businessName: (r.business_name as string) || (details.businessName as string) || "",
    hasBusiness: (details.hasBusiness as string) || "",
    productCategory: (details.productCategory as string) || "",
    sourcingNeed: (details.sourcingNeed as string) || "",
    orderSize: (details.orderSize as string) || "",
    budget: (details.budget as string) || "",
    supplierStatus: (details.supplierStatus as string) || "",
    supplierName: (details.supplierName as string) || "",
    supplierWebsite: (details.supplierWebsite as string) || "",
    negotiationSupport: (details.negotiationSupport as string) || "",
    experienceLevel: (details.experienceLevel as string) || "",
    mainGoal: (details.mainGoal as string) || "",
    timeline: (details.timeline as string) || "",
    additionalNotes: (details.additionalNotes as string) || "",
    amount: Number(r.amount || 0),
    paymentStatus: (r.payment_status as PaymentStatus) || "Successful",
    status: (r.status as SolutionStatus) || "Pending",
    date: dateStr,
    internalNotes: (r.internal_notes as string) || "",
  };
}

export async function fetchSolutionApplications(): Promise<SolutionSubmission[]> {
  try {
    const { data, error } = await supabase
      .from("solution_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToSolutionApplication);
  } catch (err) {
    console.error("Error fetching solution_applications from Supabase:", err);
    return [];
  }
}

export async function insertSolutionApplication(
  app: Partial<SolutionSubmission & { solutionId?: string; category?: string; txnId?: string }>,
): Promise<void> {
  const category =
    app.category ||
    (app.track === "Academy" || (app.track as string) === "Learning" ? "Learning" : "Business");
  const detailsObj = {
    solutionSlug: app.solutionSlug,
    location: app.location,
    hasBusiness: app.hasBusiness,
    productCategory: app.productCategory,
    sourcingNeed: app.sourcingNeed,
    orderSize: app.orderSize,
    budget: app.budget,
    supplierStatus: app.supplierStatus,
    supplierName: app.supplierName,
    supplierWebsite: app.supplierWebsite,
    negotiationSupport: app.negotiationSupport,
    experienceLevel: app.experienceLevel,
    mainGoal: app.mainGoal,
    timeline: app.timeline,
    additionalNotes: app.additionalNotes,
  };

  const { error } = await supabase.from("solution_applications").insert({
    id: app.id,
    txn_id: app.txnId || `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    solution_id: app.solutionId || "S-02",
    solution_title: app.solutionTitle || "Solution Service",
    category,
    full_name: app.fullName || "",
    email: app.email || "",
    phone: app.phone || "",
    business_name: app.businessName || "",
    amount: app.amount || 0,
    status: app.status || "Pending",
    payment_status: app.paymentStatus || "Successful",
    internal_notes: app.internalNotes || "",
    details: detailsObj,
    created_at: app.date || new Date().toISOString(),
  });

  if (error) {
    console.error("Error inserting solution_application to Supabase:", error);
    throw error;
  }
}

export async function updateSolutionApplicationStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from("solution_applications").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function updateSolutionApplicationPaymentStatus(
  id: string,
  payment_status: string,
): Promise<void> {
  const { error } = await supabase
    .from("solution_applications")
    .update({ payment_status })
    .eq("id", id);
  if (error) throw error;
}

export async function updateSolutionApplicationNotes(
  id: string,
  internal_notes: string,
): Promise<void> {
  const { error } = await supabase
    .from("solution_applications")
    .update({ internal_notes })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSolutionApplication(id: string): Promise<void> {
  const { error } = await supabase.from("solution_applications").delete().eq("id", id);
  if (error) throw error;
}

// ── TRANSACTIONS ─────────────────────────────────────────────
export type TransactionQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
};

export type PaginatedTransactionsResult = {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function rowToTransaction(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    customer: r.customer as string,
    orderId: (r.order_id as string) ?? "",
    amount: Number(r.amount),
    method: r.method as Transaction["method"],
    status: r.status as Transaction["status"],
    date: r.date as string,
  };
}

export async function fetchPaginatedTransactions(
  params: TransactionQueryParams = {},
): Promise<PaginatedTransactionsResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .order("date", { ascending: false });

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      query = query.or(`id.ilike.%${s}%,customer.ilike.%${s}%,order_id.ilike.%${s}%`);
    }

    if (params.fromDate) {
      query = query.gte("date", params.fromDate);
    }

    if (params.toDate) {
      query = query.lte("date", `${params.toDate}T23:59:59.999Z`);
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map(rowToTransaction);
    const total = count ?? mapped.length;

    return {
      transactions: mapped,
      totalCount: total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (err) {
    console.error("Failed to fetch paginated transactions from Supabase:", err);
    return {
      transactions: [],
      totalCount: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToTransaction);
  } catch (err) {
    console.error("Error fetching transactions from Supabase:", err);
    return [];
  }
}

export async function insertTransaction(t: Transaction): Promise<void> {
  const { error } = await supabase.from("transactions").insert({
    id: t.id,
    customer: t.customer,
    order_id: t.orderId,
    amount: t.amount,
    method: t.method,
    status: t.status,
    date: t.date,
  });
  if (error) throw error;
}

// ── PICKUP STATIONS ─────────────────────────────────────────
function rowToPickupStation(r: Record<string, unknown>): PickupStation {
  return {
    id: r.id as string,
    name: r.name as string,
    address: r.address as string,
    fee: Number(r.fee ?? 0),
  };
}

export async function fetchPickupStations(): Promise<PickupStation[]> {
  try {
    const { data, error } = await supabase.from("pickup_stations").select("*").order("name");
    if (error) throw error;
    return (data || []).map(rowToPickupStation);
  } catch (err) {
    console.error("Failed to fetch pickup stations from Supabase:", err);
    throw err;
  }
}

export async function insertPickupStation(p: PickupStation): Promise<void> {
  const { error } = await supabase.from("pickup_stations").insert({
    id: p.id,
    name: p.name,
    address: p.address,
    fee: p.fee ?? 0,
  });
  if (error) throw error;
}

export async function updatePickupStation(
  id: string,
  patch: Partial<PickupStation>,
): Promise<void> {
  const u: Record<string, unknown> = {};
  if (patch.name !== undefined) u.name = patch.name;
  if (patch.address !== undefined) u.address = patch.address;
  if (patch.fee !== undefined) u.fee = patch.fee;
  const { error } = await supabase.from("pickup_stations").update(u).eq("id", id);
  if (error) throw error;
}

export async function deletePickupStation(id: string): Promise<void> {
  const { error } = await supabase.from("pickup_stations").delete().eq("id", id);
  if (error) throw error;
}
