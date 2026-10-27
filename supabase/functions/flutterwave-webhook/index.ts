import { createClient } from "npm:@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, verif-hash",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
};

Deno.serve(async (req) => {
  // Handle CORS & Health Check
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "active", endpoint: "flutterwave-webhook" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const secretHash =
      Deno.env.get("FLUTTERWAVE_SECRET_HASH") ||
      Deno.env.get("FLW_SECRET_HASH");

    const signature = req.headers.get("verif-hash") || "";

    if (secretHash && signature !== secretHash) {
      console.warn("[Flutterwave Webhook] Secret hash mismatch detected.");
      return new Response(
        JSON.stringify({ error: "Invalid webhook secret hash." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json().catch(() => ({}));
    const event = String(payload?.event || payload?.["event.type"] || "").toLowerCase();
    const data = payload?.data || payload;

    const rawStatus = String(data?.status || "").toLowerCase();
    const isPaymentSuccess =
      rawStatus === "successful" ||
      rawStatus === "succeeded" ||
      event === "charge.completed" ||
      event === "charge.successful";

    const orderId =
      data?.reference ||
      data?.tx_ref ||
      data?.meta?.orderId ||
      payload?.reference;

    console.log(`[Flutterwave Webhook] 🔔 Received event: ${event}, status: ${rawStatus}, orderId: ${orderId}`);

    if (isPaymentSuccess) {
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
        console.log(`[Flutterwave Webhook] Order ${orderId} already exists (status: ${existingOrder.status}).`);
        if (existingOrder.status !== "Paid" || existingOrder.payment_status !== "Successful") {
          await supabase
            .from("orders")
            .update({
              status: "Paid",
              payment_status: "Successful",
              tracking_history: [
                { status: "Paid", date: new Date().toISOString(), admin: "Flutterwave Cloud Webhook" },
              ],
            })
            .eq("id", orderId);
        }
        return new Response(
          JSON.stringify({ success: true, message: "Order status updated to Paid." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const meta = data.meta || {};
      const customerEmail =
        data.customer?.email ||
        meta.email ||
        "";

      const customerName =
        meta.customerName ||
        (typeof data.customer?.name === "object"
          ? `${data.customer?.name?.first || ""} ${data.customer?.name?.last || ""}`.trim()
          : data.customer?.name) ||
        "Valued Customer";

      const customerPhone =
        meta.phone ||
        data.customer?.phone?.number ||
        data.customer?.phone_number ||
        "";
      const destinationAddress =
        meta.address ||
        (meta.city && meta.state
          ? `${meta.city}, ${meta.state}`
          : "Delivery Address Provided at Checkout");
      const orderTotal = Number(meta.total || data.amount || 0);
      const orderSubtotal = Number(meta.subtotal || orderTotal);
      const orderFee = meta.calculatedFee ?? Math.max(0, orderTotal - orderSubtotal);
      const deliveryMethod =
        meta.deliveryMethod === "pickup" || meta.deliveryMethod === "Pickup Station"
          ? "Pickup Station"  
          : "Courier";

      let rawItems: any[] = [];
      if (Array.isArray(meta.items)) {
        rawItems = meta.items;
      } else if (typeof meta.items === "string") {
        try {
          rawItems = JSON.parse(meta.items);
        } catch {
          rawItems = [];
        }
      }
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
        notes: meta.note || "Paid via Flutterwave Hosted Checkout (Cloud Webhook Fulfillment)",
        tracking_history: [
          { status: "Paid", date: new Date().toISOString(), admin: "Flutterwave Cloud Webhook" },
        ],
        date: new Date().toISOString(),
      });

      if (orderError) {
        console.error("[Flutterwave Webhook] Error inserting order:", orderError);
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
          notes: meta.note || "Paid via Flutterwave Hosted Checkout",
        });
      } catch (custErr) {
        console.warn("[Flutterwave Webhook] Customer upsert warning:", custErr);
      }

      // 3. Create transaction record for Admin Payments
      const rawPaymentType = String(data.payment_type || "").toLowerCase();
      const paymentMethod = rawPaymentType.includes("card")
        ? "Card"
        : rawPaymentType.includes("transfer") || rawPaymentType.includes("bank")
        ? "Bank Transfer"
        : rawPaymentType.includes("ussd")
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
        console.warn("[Flutterwave Webhook] Transaction insert warning:", txnErr);
      }

      console.log(`[Flutterwave Webhook] ✅ Order ${orderId} successfully processed.`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Processed Flutterwave event: ${event || "payment"}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[Flutterwave Webhook Error]", err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
