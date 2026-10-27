import { supabase } from "@/lib/supabase";
import type { AdminOrder, AdminOrderStatus } from "@/lib/admin-data";
import {
  fetchOrders as fetchOrdersDB,
  fetchPaginatedOrders,
  fetchOrderById,
  insertOrder as insertOrderDB,
  upsertOrderStatus as upsertOrderStatusDB,
  updateOrderNotes as updateOrderNotesDB,
  updateOrderWaybill as updateOrderWaybillDB,
  type OrderQueryParams,
  type PaginatedOrdersResult,
} from "@/lib/db/orders";

export const orderService = {
  async getPaginated(params?: OrderQueryParams): Promise<PaginatedOrdersResult> {
    return await fetchPaginatedOrders(params);
  },

  async getAll(): Promise<AdminOrder[]> {
    return await fetchOrdersDB();
  },

  async getById(id: string): Promise<AdminOrder | null> {
    return await fetchOrderById(id);
  },

  async create(order: AdminOrder): Promise<AdminOrder> {
    return await insertOrderDB(order);
  },

  async updateStatus(id: string, status: AdminOrderStatus, adminName = "System"): Promise<void> {
    await upsertOrderStatusDB(id, status, adminName);
  },

  async updateNotes(id: string, notes: string): Promise<void> {
    await updateOrderNotesDB(id, notes);
  },

  async updateWaybill(id: string, waybillNumber: string): Promise<void> {
    await updateOrderWaybillDB(id, waybillNumber);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
  },
};
