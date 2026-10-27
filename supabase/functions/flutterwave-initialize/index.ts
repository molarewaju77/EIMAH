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
    const { email, amount, orderId, callbackUrl, customerName, phone, metadata } = body;

    if (!email || !amount || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, amount, or orderId." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretKey = getFlutterwaveSecretKey();
    const baseUrl = getFlutterwaveBaseUrl();
    const safeReference = String(orderId).trim();

    // Base redirect_url without pre-existing query strings
    let redirectUrl = callbackUrl || "https://emahbrandstudio.com/checkout";
    if (redirectUrl.includes("?")) {
      redirectUrl = redirectUrl.split("?")[0];
    }

    // Sanitize meta: Flutterwave v3 strictly requires flat primitive key-values (strings/numbers).
    // Nested objects or arrays cause: {"status":"error","message":"Invalid meta data passed.","data":null}
    const sanitizedMeta: Record<string, string | number> = {
      orderId: safeReference,
    };

    if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
      for (const [key, val] of Object.entries(metadata)) {
        if (val === null || val === undefined) continue;
        if (typeof val === "string" || typeof val === "number") {
          sanitizedMeta[key] = val;
        } else if (typeof val === "boolean") {
          sanitizedMeta[key] = String(val);
        }
      }
    }

    const flwPayload = {
      tx_ref: safeReference,
      amount: Number(amount),
      currency: "NGN",
      redirect_url: redirectUrl,
      customer: {
        email: String(email).trim().toLowerCase(),
        name: customerName || "Valued Customer",
        phonenumber: phone || "",
      },
      customizations: {
        title: "Emah Brand Studio",
        description: `Payment for Order #${orderId}`,
      },
      meta: sanitizedMeta,
    };

    console.log(`[flutterwave-initialize] Calling ${baseUrl}/payments for reference: ${safeReference}, redirectUrl: ${redirectUrl}`);

    const flwRes = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flwPayload),
    });

    const resData = await flwRes.json().catch(() => ({}));
    const redirectLink = resData?.data?.link;

    if (!flwRes.ok || resData?.status !== "success" || !redirectLink) {
      const errorMsg =
        resData?.message ||
        resData?.error?.message ||
        resData?.error ||
        flwRes.statusText ||
        "Failed to initialize Flutterwave checkout";

      console.error("[flutterwave-initialize] Error response from Flutterwave:", resData);

      return new Response(
        JSON.stringify({ error: errorMsg, details: resData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          link: redirectLink,
          tx_ref: safeReference,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[flutterwave-initialize error]", err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
