import { createClient } from "npm:@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
};

/**
 * Computes HMAC-SHA512 signature in Deno / Web Crypto
 */
async function computeSha512Hmac(secretKey: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const msgData = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  // Handle CORS & Health Check
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "active", endpoint: "paystack-webhook" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not set in Supabase secrets.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("x-paystack-signature") || "";
    const rawBody = await req.text();

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing x-paystack-signature header." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify HMAC-SHA512 signature
    const expectedSignature = await computeSha512Hmac(secretKey, rawBody);
    if (expectedSignature.toLowerCase() !== signature.trim().toLowerCase()) {
      console.warn("[Paystack Webhook] Signature mismatch detected.");
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload?.event;
    const data = payload?.data;

    console.log(`[Paystack Webhook] 🔔 Received event: ${event}, reference: ${data?.reference}`);

    if (event === "charge.success" && data?.status === "success") {
      const orderId = data.reference || data.metadata?.orderId;
      if (!orderId) {
        return new Response(
          JSON.stringify({ message: "No reference or order ID found in payload." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if order exists
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, status, payment_status")
        .eq("id", orderId)
        .maybeSingle();

      if (existingOrder) {
        console.log(`[Paystack Webhook] Order ${orderId} already exists (status: ${existingOrder.status}).`);
        if (existingOrder.status !== "Paid" || existingOrder.payment_status !== "Successful") {
          await supabase
            .from("orders")
            .update({
              status: "Paid",
              payment_status: "Successful",
              tracking_history: [
                { status: "Paid", date: new Date().toISOString(), admin: "Paystack Cloud Webhook" },
              ],
            })
            .eq("id", orderId);
        }
        return new Response(
          JSON.stringify({ success: true, message: "Order status updated to Paid." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const meta = data.metadata || {};
      const customerEmail = data.customer?.email || meta.email || "";
      const customerName =
        meta.customerName ||
        `${data.customer?.first_name || ""} ${data.customer?.last_name || ""}`.trim() ||
        "Valued Customer";
      const customerPhone = meta.phone || data.customer?.phone || "";
      const destinationAddress =
        meta.address ||
        (meta.city && meta.state
          ? `${meta.city}, ${meta.state}`
          : "Delivery Address Provided at Checkout");
      const orderTotal = meta.total || (data.amount ? data.amount / 100 : 0);
      const orderSubtotal = meta.subtotal || orderTotal;
      const orderFee = meta.calculatedFee ?? Math.max(0, orderTotal - orderSubtotal);
      const deliveryMethod =
        meta.deliveryMethod === "pickup" || meta.deliveryMethod === "Pickup Station"
          ? "Pickup Station"
          : "Courier";

      const rawItems = Array.isArray(meta.items) ? meta.items : [];
      const formattedItems = rawItems.map((i: any) => ({
        name: String(i.name || "Item"),
        qty: Number(i.qty || 1),
        price: Number(i.price || 0),
        subtotal: Number(i.qty || 1) * Number(i.price || 0),
        variant: i.variant ? String(i.variant) : undefined,
        weight: Number(i.weight || 0),
      }));

      // 1. Insert order into public.orders
      const { error: orderError } = await supabase.from("orders").insert({
        id: orderId,
        tracking_id: meta.trackingId || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        customer: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: destinationAddress,
        total: orderTotal,
        subtotal: orderSubtotal,
        shipping_fee: orderFee,
        status: "Paid",
        payment_status: "Successful",
        delivery_method: deliveryMethod,
        items: formattedItems,
        notes: meta.note || "Paid via Paystack Standard Checkout (Cloud Webhook Fulfillment)",
        tracking_history: [
          { status: "Paid", date: new Date().toISOString(), admin: "Paystack Cloud Webhook" },
        ],
        date: new Date().toISOString(),
      });

      if (orderError) {
        console.error("[Paystack Webhook] Error inserting order:", orderError);
      }

      // 2. Upsert customer profile
      try {
        await supabase.from("customers").upsert({
          id: `CUST-${customerPhone.replace(/\D/g, "") || Math.floor(1000 + Math.random() * 9000)}`,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          orders: 1,
          spent: orderTotal,
          address: destinationAddress,
          city: meta.city || "",
          state: meta.state || "",
          status: "New",
          last_order: new Date().toISOString(),
          date_joined: new Date().toISOString(),
          notes: meta.note || "Paid via Paystack Standard Checkout",
        });
      } catch (custErr) {
        console.warn("[Paystack Webhook] Customer upsert warning:", custErr);
      }

      // 3. Create transaction record for Admin Payments
      const rawChannel = String(data.channel || "").toLowerCase();
      const paymentMethod = rawChannel.includes("card")
        ? "Card"
        : rawChannel.includes("transfer") || rawChannel.includes("bank")
        ? "Bank Transfer"
        : rawChannel.includes("ussd")
        ? "USSD"
        : "Card";

      try {
        await supabase.from("transactions").insert({
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          customer: customerName,
          order_id: orderId,
          amount: orderTotal,
          method: paymentMethod,
          status: "Successful",
          date: new Date().toISOString(),
        });
      } catch (txnErr) {
        console.warn("[Paystack Webhook] Transaction insert warning:", txnErr);
      }

      console.log(`[Paystack Webhook] ✅ Order ${orderId} successfully processed.`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Processed event: ${event}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[Paystack Webhook Error]", err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
