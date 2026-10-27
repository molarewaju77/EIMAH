import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customerService";
import type { AdminCustomer } from "@/lib/admin-data";
import type { CustomerQueryParams, PaginatedCustomersResult } from "@/lib/db/customers";
import { toast } from "react-toastify";

export const CUSTOMERS_QUERY_KEY = ["customers"];

export function usePaginatedCustomersQuery(params: CustomerQueryParams = {}) {
  return useQuery<PaginatedCustomersResult>({
    queryKey: [...CUSTOMERS_QUERY_KEY, "paginated", params],
    queryFn: () => customerService.getPaginated(params),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}

export function useCustomersQuery() {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEY,
    queryFn: () => customerService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useCustomerDetailQuery(id?: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, id],
    queryFn: () => (id ? customerService.getById(id) : null),
    enabled: Boolean(id),
  });
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AdminCustomer> }) =>
      customerService.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      toast.success("Customer profile updated");
    },
  });
}
