const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
};

// In-memory cache for Deno Edge Function isolate
let cachedToken: string | null = null;
let tokenExpiresAt = 0;
let cachedStates: string[] = [];
let cachedOrg: Record<string, any> | null = null;

function getFezConfig() {
  return {
    baseUrl:
      Deno.env.get("FEZ_BASE_URL") ||
      Deno.env.get("VITE_FEZ_BASE_URL") ||
      "https://api.fezdelivery.co/v1",
    secretKey:
      Deno.env.get("FEZ_SECRET_KEY") ||
      Deno.env.get("VITE_FEZ_SECRET_KEY") ||
      "",
    userId:
      Deno.env.get("FEZ_USER_ID") ||
      Deno.env.get("VITE_FEZ_USER_ID") ||
      "",
    password:
      Deno.env.get("FEZ_PASSWORD") ||
      Deno.env.get("VITE_FEZ_PASSWORD") ||
      "",
    tokenDurationMs: 50 * 60 * 1000,
  };
}

async function authenticateFez(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const config = getFezConfig();

  if (!config.userId || !config.password) {
    throw new Error(
      "Missing Fez credentials (FEZ_USER_ID / FEZ_PASSWORD) in Supabase Edge Secrets."
    );
  }
  if (!config.secretKey) {
    throw new Error("Missing Fez secret key (FEZ_SECRET_KEY) in Supabase Edge Secrets.");
  }

  const response = await fetch(`${config.baseUrl}/user/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: config.userId,
      password: config.password,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.status !== "Success" || !data?.authDetails?.authToken) {
    const reason =
      data?.description || data?.message || response.statusText || "Fez Authentication failed";
    throw new Error(`Fez Authentication Error (${response.status}): ${reason}`);
  }

  cachedToken = data.authDetails.authToken as string;
  tokenExpiresAt = Date.now() + config.tokenDurationMs;

  if (Array.isArray(data?.states) && data.states.length > 0) {
    cachedStates = [...data.states].sort((a: string, b: string) => a.localeCompare(b));
  }

  if (data?.orgDetails) {
    cachedOrg = data.orgDetails;
  }

  return cachedToken;
}

async function requestFez<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const token = await authenticateFez(isRetry);
  const config = getFezConfig();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "secret-key": config.secretKey,
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isRetry) {
    cachedToken = null;
    tokenExpiresAt = 0;
    return requestFez<T>(endpoint, options, true);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      data?.message || data?.description || response.statusText || "Fez API request failed";
    throw new Error(`Fez API Error (${response.status}): ${msg}`);
  }

  return data as T;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "").trim();

    // 1. GET STATES
    if (action === "get-states") {
      if (cachedStates.length > 0 && cachedToken && Date.now() < tokenExpiresAt) {
        return new Response(
          JSON.stringify({ success: true, states: cachedStates }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await authenticateFez();
      return new Response(
        JSON.stringify({ success: true, states: cachedStates }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. GET DELIVERY COST
    if (action === "get-cost") {
      const recipientState = String(body.recipientState || "").trim();
      if (!recipientState) {
        return new Response(
          JSON.stringify({ error: "recipientState is required to calculate delivery cost." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await authenticateFez();

      const weight = Number(body.weightInKg) || 1;
      const itemsValue = Number(body.itemsValue) || 10000;
      const originState = body.pickUpState || cachedOrg?.orgState || "Lagos";

      const payload = {
        state: recipientState,
        recipientState,
        ...(originState ? { pickUpState: originState } : {}),
        recipientCity: body.recipientCity || "",
        weight,
        valueOfItem: itemsValue,
      };

      const data = await requestFez<Record<string, any>>("/order/cost", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const rawCost = Number(
        data?.totalCost ??
          data?.totalAmount ??
          (typeof data?.cost === "number" ? data.cost : data?.cost?.cost) ??
          (typeof data?.Cost === "number" ? data.Cost : data?.Cost?.cost) ??
          data?.deliveryCost ??
          data?.data?.totalCost ??
          data?.data?.cost ??
          0
      );

      if (isNaN(rawCost) || rawCost <= 0) {
        throw new Error("Fez returned an unparseable delivery cost rate.");
      }

      const isIntraState = originState
        ? recipientState.toLowerCase() === originState.toLowerCase()
        : false;

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            cost: rawCost,
            estimatedDelivery: isIntraState ? "24 – 48 Hours" : "2 – 4 Business Days",
            courierName: "Fez Delivery Express",
            provider: "Fez Delivery Express",
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. CREATE / DISPATCH ORDER (Commented out live booking as requested)
    if (action === "create-order") {
      const payload = body.payload || {};

      /* 
      // =========================================================================
      // LIVE FEZ ORDER CREATION (Ready to enable whenever you are ready)
      // =========================================================================
      await authenticateFez();
      const originState = payload.pickUpState || cachedOrg?.orgState;
      const originAddress = payload.pickUpAddress || cachedOrg?.orgAddress;

      const orderObj: Record<string, any> = {
        recipientAddress: payload.recipientAddress,
        recipientState: payload.recipientState,
        recipientName: payload.recipientName,
        recipientPhone: payload.recipientPhone,
        recipientEmail: payload.recipientEmail,
        uniqueID: payload.uniqueID,
        BatchID: `BATCH-${Date.now()}`,
        itemDescription: payload.itemDescription || "Order Items",
        additionalDetails: payload.additionalDetails || "",
        valueOfItem: String(payload.valueOfItem || 0),
        weight: Math.max(1, Math.round(payload.weightInKg || 1)),
        isItemCod: payload.isItemCod ?? false,
      };

      if (originState) orderObj.pickUpState = originState;
      if (originAddress) orderObj.pickUpAddress = originAddress;

      const data = await requestFez<Record<string, any>>("/orders", {
        method: "POST",
        body: JSON.stringify([orderObj]),
      });

      const waybillNumber =
        (Array.isArray(data?.data) ? data?.data[0]?.waybillNumber : undefined) ||
        (Array.isArray(data) ? data[0]?.waybillNumber : undefined) ||
        data?.waybillNumber ||
        data?.data?.waybillNumber ||
        payload.uniqueID;

      return new Response(
        JSON.stringify({
          success: true,
          waybillNumber,
          message: data?.description || "Fez delivery order dispatched successfully.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      // =========================================================================
      */

      // Staging / Dry-run simulated response
      return new Response(
        JSON.stringify({
          success: true,
          waybillNumber: `FEZ-${Date.now()}`,
          message: "Fez order creation simulated (Live dispatch commented out).",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unsupported action: '${action}'. Expected 'get-states', 'get-cost', or 'create-order'.` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[fez-service error]", err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
