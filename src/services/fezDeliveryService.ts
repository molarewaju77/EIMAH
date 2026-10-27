import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FezCostRequest {
  recipientState: string;
  recipientCity?: string;
  weightInKg?: number;
  itemsValue?: number;
  pickUpState?: string;
}

export interface FezCostResult {
  cost: number;
  estimatedDelivery: string;
  courierName: string;
  provider: "Fez Delivery Express";
}

export interface FezOrderPayload {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientState: string;
  recipientCity?: string;
  uniqueID: string;
  itemDescription: string;
  additionalDetails?: string;
  valueOfItem: number | string;
  weightInKg: number;
  pickUpState?: string;
  pickUpAddress?: string;
  isItemCod?: boolean;
}

export interface FezOrderResponse {
  success: boolean;
  waybillNumber: string;
  message: string;
}

export const fezDeliveryService = {
  /**
   * Retrieves supported Nigerian delivery states via Supabase Edge Function.
   */
  async getStates(): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke("fez-service", {
        body: { action: "get-states" },
      });

      if (error) throw error;
      return data?.states || [];
    } catch (err) {
      console.warn("[Fez Delivery] Error fetching states from Edge Function:", err);
      return [];
    }
  },

  /**
   * Calculates real-time delivery cost quote via Supabase Edge Function.
   */
  async getDeliveryCost(req: FezCostRequest): Promise<FezCostResult> {
    const { data, error } = await supabase.functions.invoke("fez-service", {
      body: {
        action: "get-cost",
        recipientState: req.recipientState,
        recipientCity: req.recipientCity,
        weightInKg: req.weightInKg,
        itemsValue: req.itemsValue,
        pickUpState: req.pickUpState,
      },
    });

    if (error) {
      throw new Error(error.message || "Failed to calculate delivery fee.");
    }

    if (!data?.success || !data?.data) {
      throw new Error(data?.error || "Invalid response from Fez Delivery service.");
    }

    return data.data as FezCostResult;
  },

  /**
   * Dispatches order to Fez courier via Supabase Edge Function.
   */
  async createOrder(payload: FezOrderPayload): Promise<FezOrderResponse> {
    const { data, error } = await supabase.functions.invoke("fez-service", {
      body: {
        action: "create-order",
        payload,
      },
    });

    if (error) {
      throw new Error(error.message || "Failed to dispatch Fez delivery order.");
    }

    return data as FezOrderResponse;
  },
};
