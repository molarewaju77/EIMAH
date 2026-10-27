import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryService } from "@/services/deliveryService";
import type {
  AdminDelivery,
  DeliveryStatus,
  DeliveryQueryParams,
  PaginatedDeliveriesResult,
} from "@/lib/db/deliveries";
import { toast } from "react-toastify";

export const DELIVERIES_QUERY_KEY = ["deliveries"];

export function usePaginatedDeliveriesQuery(params: DeliveryQueryParams = {}) {
  return useQuery<PaginatedDeliveriesResult>({
    queryKey: [...DELIVERIES_QUERY_KEY, "paginated", params],
    queryFn: () => deliveryService.getPaginated(params),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}

export function useDeliveriesQuery() {
  return useQuery({
    queryKey: DELIVERIES_QUERY_KEY,
    queryFn: () => deliveryService.getAll(),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });
}

export function useDeliveryDetailQuery(id?: string) {
  return useQuery({
    queryKey: [...DELIVERIES_QUERY_KEY, id],
    queryFn: () => (id ? deliveryService.getById(id) : null),
    enabled: Boolean(id),
  });
}

export function useUpdateDeliveryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AdminDelivery> }) =>
      deliveryService.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERIES_QUERY_KEY });
      toast.success("Delivery record updated");
    },
  });
}
