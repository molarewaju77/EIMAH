const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getFlutterwaveSecretKey(): string {
  const secretKey =
    Deno.env.get("FLUTTERWAVE_SECRET_KEY") ||
    Deno.env.get("FLW_SECRET_KEY") ||
    Deno.env.get("FLUTTERWAVE_SECRET_KEY_TEST");

  if (!secretKey) {
    throw new Error(
      "Missing Flutterwave secret key. Please set FLUTTERWAVE_SECRET_KEY in Supabase secrets."
    );
  }
  return secretKey.trim();
}

function getFlutterwaveBaseUrl(): string {
  const custom = Deno.env.get("FLUTTERWAVE_BASE_URL") || Deno.env.get("FLW_BASE_URL");
  if (custom) return custom.replace(/\/+$/, "");
  return "https://api.flutterwave.com/v3";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const transactionId = body.transaction_id || body.transactionId || body.id;
    const txRef = body.tx_ref || body.txRef || body.reference || body.data;

    if (!transactionId && !txRef) {
      return new Response(
        JSON.stringify({ error: "transaction_id or tx_ref is required for payment verification." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretKey = getFlutterwaveSecretKey();
    const baseUrl = getFlutterwaveBaseUrl();

    let verifyUrl = transactionId
      ? `${baseUrl}/transactions/${encodeURIComponent(String(transactionId))}/verify`
      : `${baseUrl}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(String(txRef))}`;

    console.log(`[flutterwave-verify] Calling ${verifyUrl}`);

    let flwRes = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    let resData = await flwRes.json().catch(() => ({}));
    let data = Array.isArray(resData?.data) ? resData.data[0] : resData?.data;

    // Fallback: If verifying by transactionId didn't return record, try verify_by_reference
    if ((!flwRes.ok || !data) && transactionId && txRef) {
      const fallbackUrl = `${baseUrl}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(String(txRef))}`;
      console.log(`[flutterwave-verify] Attempting fallback by reference: ${fallbackUrl}`);
      const fallbackRes = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      });
      const fallbackData = await fallbackRes.json().catch(() => ({}));
      if (fallbackRes.ok && fallbackData?.data) {
        data = Array.isArray(fallbackData.data) ? fallbackData.data[0] : fallbackData.data;
        resData = fallbackData;
        flwRes = fallbackRes;
      }
    }

    if (!flwRes.ok || !data) {
      const errorMsg =
        resData?.error?.message ||
        resData?.error ||
        "No completed transaction record found for this reference.";
      return new Response(
        JSON.stringify({ success: false, error: errorMsg, details: resData }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawStatus = String(data.status || "").toLowerCase();
    const isSuccessful =
      rawStatus === "successful" || rawStatus === "succeeded" || rawStatus === "completed";

    if (!isSuccessful) {
      return new Response(
        JSON.stringify({
          success: false,
          status: data.status || "failed",
          error: `Transaction status is '${data.status || "unsuccessful"}'. Payment was not completed.`,
          data: {
            id: data.id,
            tx_ref: data.tx_ref || txRef,
            status: data.status || "failed",
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: data.status,
        data: {
          id: data.id,
          tx_ref: data.tx_ref || txRef,
          flw_ref: data.flw_ref || data.id,
          amount: data.amount,
          currency: data.currency || "NGN",
          charged_amount: data.charged_amount || data.amount,
          status: data.status,
          payment_type: data.payment_type || "card",
          created_at: data.created_at || new Date().toISOString(),
          customer: {
            name: typeof data.customer === "object" ? data.customer?.name || "" : "",
            email: typeof data.customer === "object" ? data.customer?.email || "" : "",
            phone: typeof data.customer === "object" ? data.customer?.phone_number || "" : "",
          },
          meta: data.meta || {},
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[flutterwave-verify error]", err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
