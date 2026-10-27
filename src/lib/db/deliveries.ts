import { supabase } from "../supabase";

export type DeliveryStatus =
  | "Pending Dispatch"
  | "Picked Up"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"
  | "Failed";

export type AdminDelivery = {
  id: string;
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  state: string;
  courierName: string;
  trackingNumber?: string;
  shippingFee: number;
  status: DeliveryStatus;
  dispatchDate?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  driverNotes?: string;
  createdAt: string;
};

function rowToDelivery(r: Record<string, unknown>): AdminDelivery {
  return {
    id: r.id as string,
    orderId: r.order_id as string,
    recipientName: r.recipient_name as string,
    recipientPhone: r.recipient_phone as string,
    address: r.address as string,
    city: r.city as string,
    state: r.state as string,
    courierName: (r.courier_name as string) ?? "EIMAH Direct Dispatch",
    trackingNumber: (r.tracking_number as string) ?? undefined,
    shippingFee: Number(r.shipping_fee ?? 0),
    status: (r.status as DeliveryStatus) ?? "Pending Dispatch",
    dispatchDate: (r.dispatch_date as string) ?? undefined,
    estimatedDelivery: (r.estimated_delivery as string) ?? undefined,
    deliveredAt: (r.delivered_at as string) ?? undefined,
    driverNotes: (r.driver_notes as string) ?? undefined,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

export const seedDeliveries: AdminDelivery[] = [
  {
    id: "DEL-1001",
    orderId: "EMH-10240",
    recipientName: "Chiamaka Eze",
    recipientPhone: "+234 802 345 6789",
    address: "22 Isaac John Street, Ikeja GRA",
    city: "Ikeja",
    state: "Lagos",
    courierName: "FEZ Delivery",
    trackingNumber: "FEZ-2026-8891",
    shippingFee: 3500,
    status: "In Transit",
    dispatchDate: "2026-08-13T10:00:00Z",
    estimatedDelivery: "2026-08-14",
    driverNotes: "Driver contacted customer. Scheduled for afternoon delivery.",
    createdAt: "2026-08-13T09:10:48Z",
  },
  {
    id: "DEL-1002",
    orderId: "EMH-10241",
    recipientName: "Adaeze Okonkwo",
    recipientPhone: "+234 803 112 4455",
    address: "14 Admiralty Way, Lekki Phase 1",
    city: "Lekki",
    state: "Lagos",
    courierName: "FEZ Delivery",
    trackingNumber: "FEZ-2026-9042",
    shippingFee: 2500,
    status: "Delivered",
    dispatchDate: "2026-08-12T09:00:00Z",
    estimatedDelivery: "2026-08-12",
    deliveredAt: "2026-08-12T15:30:00Z",
    driverNotes: "Package received and signed by estate security guard.",
    createdAt: "2026-08-12T08:30:00Z",
  },
  {
    id: "DEL-1003",
    orderId: "EMH-10242",
    recipientName: "Tunde Bakare",
    recipientPhone: "+234 805 998 7766",
    address: "5 Allen Avenue",
    city: "Ikeja",
    state: "Lagos",
    courierName: "FEZ Delivery",
    trackingNumber: "FEZ-2026-9110",
    shippingFee: 3000,
    status: "Out for Delivery",
    dispatchDate: "2026-08-14T08:00:00Z",
    estimatedDelivery: "2026-08-14",
    driverNotes: "Courier rider is out for final dropoff.",
    createdAt: "2026-08-14T07:15:00Z",
  },
  {
    id: "DEL-1004",
    orderId: "EMH-10243",
    recipientName: "Ibrahim Musa",
    recipientPhone: "+234 811 443 2211",
    address: "12 Wuse 2 Commercial District",
    city: "Abuja",
    state: "FCT",
    courierName: "FEZ Express Intercity",
    trackingNumber: "FEZ-2026-7734",
    shippingFee: 6500,
    status: "Pending Dispatch",
    estimatedDelivery: "2026-08-16",
    driverNotes: "Awaiting intercity dispatch team pickup from hub.",
    createdAt: "2026-08-14T08:00:00Z",
  },
  {
    id: "DEL-1005",
    orderId: "EMH-10244",
    recipientName: "Fatima Bello",
    recipientPhone: "+234 809 332 1100",
    address: "9 Independence Way",
    city: "Kaduna",
    state: "Kaduna",
    courierName: "FEZ Express Intercity",
    trackingNumber: "FEZ-2026-6521",
    shippingFee: 3500,
    status: "Picked Up",
    dispatchDate: "2026-08-13T16:20:00Z",
    estimatedDelivery: "2026-08-15",
    driverNotes: "Picked up from Lekki hub, currently in sorting center.",
    createdAt: "2026-08-13T14:45:00Z",
  },
];

export type DeliveryQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
};

export type PaginatedDeliveriesResult = {
  deliveries: AdminDelivery[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function fetchPaginatedDeliveries(
  params: DeliveryQueryParams = {},
): Promise<PaginatedDeliveriesResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from("deliveries")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      query = query.or(
        `order_id.ilike.%${s}%,recipient_name.ilike.%${s}%,tracking_number.ilike.%${s}%,recipient_phone.ilike.%${s}%`,
      );
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map((d) => rowToDelivery(d as Record<string, unknown>));
    const total = count ?? mapped.length;

    return {
      deliveries: mapped,
      totalCount: total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (err) {
    console.warn("Failed to fetch paginated deliveries from Supabase, falling back to seed data:", err);
    let list = [...seedDeliveries];
    if (params.status && params.status !== "all") {
      list = list.filter((d) => d.status === params.status);
    }
    if (params.search && params.search.trim()) {
      const s = params.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.orderId.toLowerCase().includes(s) ||
          d.recipientName.toLowerCase().includes(s) ||
          (d.trackingNumber ?? "").toLowerCase().includes(s) ||
          d.recipientPhone.toLowerCase().includes(s),
      );
    }
    const total = list.length;
    const paginated = list.slice(from, to + 1);
    return {
      deliveries: paginated,
      totalCount: total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }
}

export async function fetchDeliveries(): Promise<AdminDelivery[]> {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      return seedDeliveries;
    }
    return data.map(rowToDelivery);
  } catch (err) {
    console.warn("Failed to fetch deliveries from Supabase, falling back to seed data:", err);
    return seedDeliveries;
  }
}


function formatEstimatedDate(val?: string): string | null {
  if (!val) return null;
  // If it's already an ISO date (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
    return val.split("T")[0];
  }
  const lower = val.toLowerCase();
  const target = new Date();
  if (lower.includes("hour") || lower.includes("24") || lower.includes("48") || lower.includes("1-2")) {
    target.setDate(target.getDate() + 2);
  } else if (lower.includes("4") || lower.includes("business")) {
    target.setDate(target.getDate() + 4);
  } else {
    target.setDate(target.getDate() + 3);
  }
  return target.toISOString().split("T")[0];
}

export async function insertDelivery(d: AdminDelivery): Promise<void> {
  const { error } = await supabase.from("deliveries").insert({
    id: d.id,
    order_id: d.orderId,
    recipient_name: d.recipientName,
    recipient_phone: d.recipientPhone,
    address: d.address,
    city: d.city,
    state: d.state,
    courier_name: d.courierName,
    tracking_number: d.trackingNumber || null,
    shipping_fee: d.shippingFee,
    status: d.status,
    dispatch_date: d.dispatchDate || null,
    estimated_delivery: formatEstimatedDate(d.estimatedDelivery),
    delivered_at: d.deliveredAt || null,
    driver_notes: d.driverNotes || null,
  });
  if (error) throw error;
}

export async function updateDeliveryStatusDB(
  id: string,
  status: DeliveryStatus,
): Promise<void> {
  const patch: Record<string, unknown> = { status };
  if (status === "Delivered") {
    patch.delivered_at = new Date().toISOString();
  }
  if (status === "In Transit" || status === "Picked Up") {
    patch.dispatch_date = new Date().toISOString();
  }
  const { error } = await supabase.from("deliveries").update(patch).eq("id", id);
  if (error) throw error;
}

export async function updateDeliveryDB(
  id: string,
  patch: Partial<AdminDelivery>,
): Promise<void> {
  const u: Record<string, unknown> = {};
  if (patch.recipientName !== undefined) u.recipient_name = patch.recipientName;
  if (patch.recipientPhone !== undefined) u.recipient_phone = patch.recipientPhone;
  if (patch.address !== undefined) u.address = patch.address;
  if (patch.city !== undefined) u.city = patch.city;
  if (patch.state !== undefined) u.state = patch.state;
  if (patch.courierName !== undefined) u.courier_name = patch.courierName;
  if (patch.trackingNumber !== undefined) u.tracking_number = patch.trackingNumber || null;
  if (patch.shippingFee !== undefined) u.shipping_fee = patch.shippingFee;
  if (patch.status !== undefined) u.status = patch.status;
  if (patch.dispatchDate !== undefined) u.dispatch_date = patch.dispatchDate || null;
  if (patch.estimatedDelivery !== undefined)
    u.estimated_delivery = formatEstimatedDate(patch.estimatedDelivery);
  if (patch.driverNotes !== undefined) u.driver_notes = patch.driverNotes || null;

  const { error } = await supabase.from("deliveries").update(u).eq("id", id);
  if (error) throw error;
}

export async function deleteDeliveryDB(id: string): Promise<void> {
  const { error } = await supabase.from("deliveries").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchDeliveryById(id: string): Promise<AdminDelivery | null> {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToDelivery(data as Record<string, unknown>);
}
