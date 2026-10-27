import { supabase } from "../supabase";
import { type AdminOrder, type AdminOrderStatus } from "../admin-data";

function rowToOrder(row: Record<string, unknown>): AdminOrder {
  const items = Array.isArray(row.items) ? row.items : [];
  const tracking = Array.isArray(row.tracking_history) ? row.tracking_history : [];

  return {
    id: row.id as string,
    trackingId: (row.tracking_id as string) || (row.trackingId as string) || (row.id as string),
    customer: row.customer as string,
    email: row.email as string,
    phone: (row.phone as string) ?? "",
    date: (row.date as string) || (row.created_at as string) || new Date().toISOString(),
    total: Number(row.total),
    subtotal: Number(row.subtotal ?? 0),
    shippingFee: Number(row.shipping_fee ?? 0),
    status: (row.status as AdminOrderStatus) ?? "Paid",
    paymentStatus:
      (row.payment_status as string)?.toLowerCase() === "paid" ||
      (row.payment_status as string)?.toLowerCase() === "successful"
        ? "Successful"
        : ((row.payment_status as any) ?? "Successful"),
    deliveryMethod:
      (row.delivery_method as "Courier" | "Pickup Station") ||
      (row.deliveryMethod as "Courier" | "Pickup Station") ||
      "Courier",
    address: (row.address as string) ?? "",
    waybillNumber: (row.waybill_number as string) || (row.waybillNumber as string) || "",
    internalNotes: (row.internal_notes as string) ?? "",
    items: items.map((i: any) => ({
      name: i.name as string,
      qty: Number(i.qty ?? 1),
      price: Number(i.price ?? 0),
      subtotal: Number(i.subtotal ?? Number(i.price ?? 0) * Number(i.qty ?? 1)),
      variant: (i.variant as string) ?? undefined,
      weight: i.weight !== undefined && i.weight !== null ? Number(i.weight) : 0,
    })),
    trackingHistory: tracking.map((t: any) => ({
      status: t.status as AdminOrderStatus,
      date: t.date as string,
      admin: t.admin as string,
    })),
  };
}

export type OrderQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  deliveryMethod?: "Courier" | "Pickup Station";
};

export type PaginatedOrdersResult = {
  orders: AdminOrder[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function fetchPaginatedOrders(
  params: OrderQueryParams = {},
): Promise<PaginatedOrdersResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("date", { ascending: false });

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    if (params.deliveryMethod) {
      query = query.eq("delivery_method", params.deliveryMethod);
    }

    if (params.startDate && params.startDate.trim()) {
      const startIso = new Date(params.startDate).toISOString();
      query = query.gte("date", startIso);
    }

    if (params.endDate && params.endDate.trim()) {
      const endD = new Date(params.endDate);
      endD.setHours(23, 59, 59, 999);
      query = query.lte("date", endD.toISOString());
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      query = query.or(
        `id.ilike.%${s}%,tracking_id.ilike.%${s}%,customer.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`,
      );
    }

    query = query.range(from, to);

    const { data: orders, count, error: oErr } = await query;
    if (oErr) throw oErr;

    const mapped = (orders || []).map((o) => rowToOrder(o as Record<string, unknown>));
    const total = count ?? mapped.length;

    return {
      orders: mapped,
      totalCount: total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (err) {
    console.warn("Failed to fetch paginated orders from Supabase:", err);
    return {
      orders: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function fetchOrders(): Promise<AdminOrder[]> {
  try {
    const { data: orders, error: oErr } = await supabase
      .from("orders")
      .select("*")
      .order("date", { ascending: false });
    if (oErr) throw oErr;

    if (!orders || orders.length === 0) {
      return [];
    }

    return orders.map((o) => rowToOrder(o as Record<string, unknown>));
  } catch (err) {
    console.warn("Failed to fetch orders from Supabase:", err);
    return [];
  }
}

export async function upsertOrderStatus(
  id: string,
  status: AdminOrderStatus,
  adminName: string,
): Promise<void> {
  const existing = await fetchOrderById(id);
  const updatedHistory = [
    ...(existing?.trackingHistory || []),
    {
      status,
      date: new Date().toISOString(),
      admin: adminName,
    },
  ];

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      tracking_history: updatedHistory,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function updateOrderNotes(id: string, notes: string): Promise<void> {
  const { error } = await supabase.from("orders").update({ internal_notes: notes }).eq("id", id);
  if (error) throw error;
}

export async function insertOrder(o: AdminOrder): Promise<AdminOrder> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      id: o.id,
      tracking_id: o.trackingId || undefined,
      customer: o.customer,
      email: o.email,
      phone: o.phone || "",
      address: o.address || "",
      total: o.total,
      subtotal: o.subtotal || o.total,
      shipping_fee: o.shippingFee || 0,
      status: o.status || "Paid",
      delivery_method: o.deliveryMethod,
      payment_status: o.paymentStatus || "Successful",
      waybill_number: o.waybillNumber || "",
      internal_notes: o.internalNotes || "",
      items: o.items || [],
      tracking_history: o.trackingHistory || [
        {
          status: o.status || "Paid",
          date: new Date().toISOString(),
          admin: "System",
        },
      ],
    })
    .select()
    .single();

  if (error) throw error;
  return rowToOrder(data as Record<string, unknown>);
}

export async function updateOrderWaybill(id: string, waybillNumber: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ waybill_number: waybillNumber })
    .eq("id", id);
  if (error) throw error;
}

export async function fetchOrderById(id: string): Promise<AdminOrder | null> {
  const trimmed = id.trim();
  try {
    const { data: order, error: oErr } = await supabase
      .from("orders")
      .select("*")
      .or(`id.ilike.${trimmed},tracking_id.ilike.${trimmed}`)
      .maybeSingle();
    if (oErr || !order) {
      return null;
    }
    return rowToOrder(order as Record<string, unknown>);
  } catch (err) {
    console.warn("Failed to fetch order by ID from Supabase:", err);
    return null;
  }
}
