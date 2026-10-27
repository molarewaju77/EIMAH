import { supabase } from "@/lib/supabase";

export interface InitializeFlutterwaveInput {
  email: string;
  amount: number; // in Naira
  orderId: string;
  callbackUrl: string;
  customerName?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface FlutterwaveVerifyResult {
  id?: number | string;
  charge_id?: string;
  tx_ref: string;
  flw_ref?: string;
  amount: number;
  currency: string;
  status: "succeeded" | "successful" | "failed" | string;
  payment_type?: string;
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
  };
  meta?: Record<string, any>;
}

/**
 * Initializes a Flutterwave checkout session via the dedicated Supabase Edge Function: `flutterwave-initialize`.
 */
export async function initializeFlutterwavePayment(
  inputOrData: InitializeFlutterwaveInput | { data: InitializeFlutterwaveInput }
): Promise<{
  link: string;
  tx_ref: string;
}> {
  const input = "data" in inputOrData ? inputOrData.data : inputOrData;

  const { data, error } = await supabase.functions.invoke("flutterwave-initialize", {
    body: {
      email: input.email,
      amount: input.amount,
      orderId: input.orderId,
      callbackUrl: input.callbackUrl,
      customerName: input.customerName,
      phone: input.phone,
      metadata: input.metadata,
    },
  });

  if (error) {
    let errorDetail = error.message;
    try {
      if (error.context && typeof error.context.json === "function") {
        const body = await error.context.json();
        errorDetail = body.error || body.message || errorDetail;
      }
    } catch {}
    throw new Error(errorDetail || "Failed to initialize Flutterwave checkout via Edge Function.");
  }

  if (!data?.success || !data?.data?.link) {
    throw new Error(data?.error || "Invalid response from Flutterwave checkout service.");
  }

  return data.data;
}

/**
 * Verifies a Flutterwave transaction by ID or tx_ref via the dedicated Supabase Edge Function: `flutterwave-verify`.
 */
export async function verifyFlutterwavePayment(
  inputOrRef: string | { data: string; transaction_id?: string } | { transaction_id: string; tx_ref?: string }
): Promise<FlutterwaveVerifyResult> {
  let body: Record<string, any> = {};

  if (typeof inputOrRef === "string") {
    body = { tx_ref: inputOrRef };
  } else if ("data" in inputOrRef) {
    body = {
      tx_ref: inputOrRef.data,
      transaction_id: inputOrRef.transaction_id,
    };
  } else {
    body = inputOrRef;
  }

  const { data, error } = await supabase.functions.invoke("flutterwave-verify", {
    body,
  });

  if (error) {
    let errorDetail = error.message;
    try {
      if (error.context && typeof error.context.json === "function") {
        const errBody = await error.context.json();
        errorDetail = errBody.error || errBody.message || errorDetail;
      }
    } catch {}
    throw new Error(errorDetail || "Failed to verify Flutterwave payment via Edge Function.");
  }

  if (!data?.success || !data?.data) {
    throw new Error(data?.error || "Flutterwave payment verification failed.");
  }

  return data.data as FlutterwaveVerifyResult;
}
