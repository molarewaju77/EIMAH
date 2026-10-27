import { supabase } from "../supabase";
import { type AdminCustomer } from "../admin-data";

function rowToCustomer(row: Record<string, unknown>): AdminCustomer {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? "",
    orders: Number(row.orders ?? 0),
    spent: Number(row.spent ?? 0),
    address: (row.address as string) ?? "",
    city: (row.city as string) ?? "",
    state: (row.state as string) ?? "",
    status: (row.status as AdminCustomer["status"]) ?? "New",
    lastOrder: (row.last_order as string) ?? "",
    dateJoined: (row.date_joined as string) ?? "",
    notes: (row.notes as string) ?? "",
  };
}

export type CustomerQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export type PaginatedCustomersResult = {
  customers: AdminCustomer[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function fetchPaginatedCustomers(
  params: CustomerQueryParams = {},
): Promise<PaginatedCustomersResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from("customers")
      .select("*", { count: "exact" })
      .order("date_joined", { ascending: false });

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    if (params.startDate && params.startDate.trim()) {
      const startIso = new Date(params.startDate).toISOString();
      query = query.gte("date_joined", startIso);
    }

    if (params.endDate && params.endDate.trim()) {
      const endD = new Date(params.endDate);
      endD.setHours(23, 59, 59, 999);
      query = query.lte("date_joined", endD.toISOString());
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`);
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map((c) => rowToCustomer(c as Record<string, unknown>));
    const total = count ?? mapped.length;

    return {
      customers: mapped,
      totalCount: total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (err) {
    console.warn("Failed to fetch paginated customers from Supabase:", err);
    return {
      customers: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function fetchCustomers(): Promise<AdminCustomer[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("date_joined", { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }
    return data.map(rowToCustomer);
  } catch (err) {
    console.warn("Failed to fetch customers from Supabase:", err);
    return [];
  }
}

export async function updateCustomer(id: string, patch: Partial<AdminCustomer>): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.orders !== undefined) update.orders = patch.orders;
  if (patch.spent !== undefined) update.spent = patch.spent;
  if (patch.address !== undefined) update.address = patch.address;
  if (patch.city !== undefined) update.city = patch.city;
  if (patch.state !== undefined) update.state = patch.state;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.lastOrder !== undefined) update.last_order = patch.lastOrder;
  if (patch.notes !== undefined) update.notes = patch.notes;

  const { error } = await supabase.from("customers").update(update).eq("id", id);
  if (error) throw error;
}

export async function upsertCustomer(c: AdminCustomer): Promise<void> {
  // Check if customer with this email already exists
  const { data: existing } = await supabase
    .from("customers")
    .select("id, orders, spent")
    .eq("email", c.email)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("customers")
      .update({
        name: c.name,
        phone: c.phone || undefined,
        orders: (Number(existing.orders) || 0) + 1,
        spent: (Number(existing.spent) || 0) + (Number(c.spent) || 0),
        address: c.address,
        city: c.city,
        state: c.state,
        last_order: c.lastOrder || new Date().toISOString(),
        notes: c.notes,
      })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("customers").insert({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      orders: c.orders || 1,
      spent: c.spent || 0,
      address: c.address,
      city: c.city,
      state: c.state,
      status: c.status || "New",
      last_order: c.lastOrder || new Date().toISOString(),
      date_joined: c.dateJoined || new Date().toISOString(),
      notes: c.notes,
    });
    if (error) throw error;
  }
}

export async function fetchCustomerById(id: string): Promise<AdminCustomer | null> {
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
  if (error) return null;
  return rowToCustomer(data as Record<string, unknown>);
}
