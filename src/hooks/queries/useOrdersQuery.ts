import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import type { AdminOrder, AdminOrderStatus } from "@/lib/admin-data";
import type { OrderQueryParams, PaginatedOrdersResult } from "@/lib/db/orders";
import { toast } from "react-toastify";

export const ORDERS_QUERY_KEY = ["orders"];

export function usePaginatedOrdersQuery(params: OrderQueryParams = {}) {
  return useQuery<PaginatedOrdersResult>({
    queryKey: [...ORDERS_QUERY_KEY, "paginated", params],
    queryFn: () => orderService.getPaginated(params),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}

export function useOrdersQuery() {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => orderService.getAll(),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });
}

export function useOrderDetailQuery(id?: string) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, id],
    queryFn: () => (id ? orderService.getById(id) : null),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      adminName,
    }: {
      id: string;
      status: AdminOrderStatus;
      adminName?: string;
    }) => orderService.updateStatus(id, status, adminName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      toast.success("Order status updated");
    },
    onError: (err) => {
      toast.error(`Failed to update order status: ${(err as Error).message}`);
    },
  });
}

export function useUpdateOrderNotesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      orderService.updateNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      toast.success("Internal notes updated");
    },
  });
}

export function useUpdateOrderWaybillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, waybillNumber }: { id: string; waybillNumber: string }) =>
      orderService.updateWaybill(id, waybillNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      toast.success("Waybill number saved");
    },
    onError: (err) => {
      toast.error(`Failed to update waybill: ${(err as Error).message}`);
    },
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (order: AdminOrder) => orderService.create(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(`Failed to save order: ${(err as Error).message}`);
    },
  });
}
