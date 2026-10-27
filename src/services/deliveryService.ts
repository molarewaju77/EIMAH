import type {
  AdminDelivery,
  DeliveryStatus,
  DeliveryQueryParams,
  PaginatedDeliveriesResult,
} from "@/lib/db/deliveries";
import {
  fetchDeliveries as fetchDeliveriesDB,
  fetchPaginatedDeliveries,
  fetchDeliveryById,
  insertDelivery as insertDeliveryDB,
  updateDeliveryDB,
  updateDeliveryStatusDB,
  deleteDeliveryDB,
} from "@/lib/db/deliveries";

export const deliveryService = {
  async getPaginated(params?: DeliveryQueryParams): Promise<PaginatedDeliveriesResult> {
    return await fetchPaginatedDeliveries(params);
  },

  async getAll(): Promise<AdminDelivery[]> {
    return await fetchDeliveriesDB();
  },

  async getById(id: string): Promise<AdminDelivery | null> {
    return await fetchDeliveryById(id);
  },

  async create(delivery: AdminDelivery): Promise<void> {
    await insertDeliveryDB(delivery);
  },

  async updateStatus(id: string, status: DeliveryStatus): Promise<void> {
    await updateDeliveryStatusDB(id, status);
  },

  async update(id: string, patch: Partial<AdminDelivery>): Promise<void> {
    await updateDeliveryDB(id, patch);
  },

  async delete(id: string): Promise<void> {
    await deleteDeliveryDB(id);
  },
};
