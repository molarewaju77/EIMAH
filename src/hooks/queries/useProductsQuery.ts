import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import type { AdminProduct } from "@/lib/admin-data";
import type { ProductQueryParams, PaginatedProductsResult } from "@/lib/db/products";
import { toast } from "react-toastify";

export const PRODUCTS_QUERY_KEY = ["products"];

export function usePaginatedProductsQuery(params: ProductQueryParams = {}) {
  return useQuery<PaginatedProductsResult>({
    queryKey: [...PRODUCTS_QUERY_KEY, "paginated", params],
    queryFn: () => productService.getPaginated(params),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    placeholderData: keepPreviousData,
  });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: () => productService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useProductDetailQuery(id?: string) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, id],
    queryFn: () => (id ? productService.getById(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: AdminProduct) => productService.create(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success("Product created successfully");
    },
    onError: (err) => {
      toast.error(`Failed to create product: ${(err as Error).message}`);
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AdminProduct> }) =>
      productService.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success("Product updated successfully");
    },
    onError: (err) => {
      toast.error(`Failed to update product: ${(err as Error).message}`);
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success("Product deleted");
    },
    onError: (err) => {
      toast.error(`Failed to delete product: ${(err as Error).message}`);
    },
  });
}
