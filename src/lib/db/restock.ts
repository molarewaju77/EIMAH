import { supabase } from "../supabase";

export type RestockRequest = {
  id: string;
  customer_email: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  variant: string;
  demanded_quantity: number;
  available_stock: number;
  created_at: string;
};

const LOCAL_STORAGE_KEY = "emah_restock_requests";

function getLocalRequests(): RestockRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRequest(req: RestockRequest) {
  try {
    const list = getLocalRequests();
    list.unshift(req);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore localStorage write failures
  }
}

export async function submitRestockRequest(data: {
  customerEmail: string;
  productId: string;
  productName: string;
  productSlug: string;
  variant?: string;
  demandedQuantity: number;
  availableStock: number;
}): Promise<{ success: boolean; error?: string }> {
  const newRequest: RestockRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    customer_email: data.customerEmail.trim().toLowerCase(),
    product_id: data.productId,
    product_name: data.productName,
    product_slug: data.productSlug,
    variant: data.variant || "Standard",
    demanded_quantity: data.demandedQuantity,
    available_stock: data.availableStock,
    created_at: new Date().toISOString(),
  };

  // 1. Save to local storage as instant backup
  saveLocalRequest(newRequest);

  // 2. Save to Supabase `restock_requests` table
  try {
    const { error: dbError } = await supabase.from("restock_requests").insert({
      id: newRequest.id,
      customer_email: newRequest.customer_email,
      product_id: newRequest.product_id,
      product_name: newRequest.product_name,
      product_slug: newRequest.product_slug,
      variant: newRequest.variant,
      demanded_quantity: newRequest.demanded_quantity,
      available_stock: newRequest.available_stock,
      created_at: newRequest.created_at,
    });

    if (dbError) {
      console.warn("[Restock Request] Supabase insert warning (check RLS policy):", dbError.message);
    }
  } catch (err: any) {
    console.warn("[Restock Request] Table insert error:", err?.message || err);
  }

  // 3. Send email to admin (hello@eimah.com) via Edge Function
  try {
    const variantLine = data.variant && data.variant !== "Standard" ? `\n• Variant / Options: ${data.variant}` : "";
    const messageBody = `Hello Admin,

A customer wants to purchase an item with higher quantity than currently available in stock:

• Product: ${data.productName}${variantLine}
• Demanded Quantity: ${data.demandedQuantity} unit(s)
• Available Stock at request: ${data.availableStock} unit(s)
• Customer Email: ${newRequest.customer_email}
• Requested Date: ${new Date(newRequest.created_at).toLocaleString()}

You can reply directly to this email to contact the customer once stock is replenished.`;

    const { error: emailError } = await supabase.functions.invoke("send-contact-email", {
      body: {
        name: "Esteemed Customer",
        email: newRequest.customer_email,
        phone: "N/A",
        subject: `🔔 Restock Request: ${data.productName} (${data.demandedQuantity} pcs requested)`,
        message: messageBody,
      },
    });

    if (emailError) {
      console.warn("[Restock Request] Email dispatch warning:", emailError.message);
    }
  } catch (err: any) {
    console.warn("[Restock Request] Email dispatch error:", err?.message || err);
  }

  return { success: true };
}

export async function fetchRestockRequests(): Promise<RestockRequest[]> {
  try {
    const { data, error } = await supabase
      .from("restock_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as RestockRequest[];
    }
  } catch (err) {
    console.warn("[Restock Requests] Failed to query Supabase:", err);
  }
  return getLocalRequests();
}
