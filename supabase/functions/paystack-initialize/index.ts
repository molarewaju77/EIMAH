const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY secret is not set in Supabase.");
    }

    const body = await req.json().catch(() => ({}));
    const { email, amount, orderId, callbackUrl, metadata } = body;

    if (!email || !amount || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, amount, or orderId." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert Naira to Kobo (Math.round prevents float precision issues)
    const amountInKobo = Math.round(Number(amount) * 100);

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        amount: amountInKobo,
        reference: String(orderId).trim(),
        callback_url: callbackUrl || undefined,
        metadata: metadata || undefined,
      }),
    });

    const resData = await paystackRes.json().catch(() => ({}));

    if (!paystackRes.ok || !resData?.status || !resData?.data?.authorization_url) {
      const errorMsg = resData?.message || paystackRes.statusText || "Failed to initialize Paystack checkout";
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: resData.data.authorization_url,
          access_code: resData.data.access_code,
          reference: resData.data.reference,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[paystack-initialize error]", err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
