import { supabase } from "@/lib/supabase";
import type { AdminCustomer } from "@/lib/admin-data";
import {
  fetchCustomers as fetchCustomersDB,
  fetchPaginatedCustomers,
  fetchCustomerById,
  updateCustomer as updateCustomerDB,
  upsertCustomer as upsertCustomerDB,
  type CustomerQueryParams,
  type PaginatedCustomersResult,
} from "@/lib/db/customers";

export const customerService = {
  async getPaginated(params?: CustomerQueryParams): Promise<PaginatedCustomersResult> {
    return await fetchPaginatedCustomers(params);
  },

  async getAll(): Promise<AdminCustomer[]> {
    return await fetchCustomersDB();
  },

  async getById(id: string): Promise<AdminCustomer | null> {
    return await fetchCustomerById(id);
  },

  async create(customer: AdminCustomer): Promise<void> {
    await upsertCustomerDB(customer);
  },

  async update(id: string, patch: Partial<AdminCustomer>): Promise<void> {
    await updateCustomerDB(id, patch);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
  },
};