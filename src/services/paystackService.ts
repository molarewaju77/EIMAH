import { supabase } from "@/lib/supabase";

export interface InitializePaystackInput {
  email: string;
  amount: number; // in Naira
  orderId: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export interface PaystackVerifyResult {
  status: "success" | "failed" | "abandoned" | string;
  reference: string;
  amount: number; // in Kobo
  paid_at: string;
  channel: string;
  currency: string;
  customer: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Initializes a Paystack checkout session via the dedicated Supabase Edge Function: `paystack-initialize`.
 * The PAYSTACK_SECRET_KEY is stored securely in Supabase Cloud.
 */
export async function initializePaystackPayment(
  inputOrData: InitializePaystackInput | { data: InitializePaystackInput }
): Promise<{
  authorization_url: string;
  access_code: string;
  reference: string;
}> {
  const input = "data" in inputOrData ? inputOrData.data : inputOrData;

  const { data, error } = await supabase.functions.invoke("paystack-initialize", {
    body: {
      email: input.email,
      amount: input.amount,
      orderId: input.orderId,
      callbackUrl: input.callbackUrl,
      metadata: input.metadata,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to initialize Paystack checkout via Edge Function.");
  }

  if (!data?.success || !data?.data?.authorization_url) {
    throw new Error(data?.error || "Invalid response from Paystack checkout service.");
  }

  return data.data;
}

/**
 * Verifies a Paystack transaction by reference via the dedicated Supabase Edge Function: `paystack-verify`.
 */
export async function verifyPaystackPayment(
  inputOrRef: string | { data: string }
): Promise<PaystackVerifyResult> {
  const reference = typeof inputOrRef === "string" ? inputOrRef : inputOrRef.data;

  const { data, error } = await supabase.functions.invoke("paystack-verify", {
    body: {
      reference,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to verify Paystack payment via Edge Function.");
  }

  if (!data?.success || !data?.data) {
    throw new Error(data?.error || "Paystack payment verification failed.");
  }

  return data.data as PaystackVerifyResult;
}
