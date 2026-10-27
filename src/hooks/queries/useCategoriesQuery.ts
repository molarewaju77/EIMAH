import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import type { AdminCategory } from "@/lib/admin-store";
import { toast } from "react-toastify";

export const CATEGORIES_QUERY_KEY = ["categories"];

export function useCategoriesQuery() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => productService.getCategories(),
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: AdminCategory) => productService.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category created successfully");
    },
    onError: (err) => {
      toast.error(`Failed to create category: ${(err as Error).message}`);
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, patch }: { slug: string; patch: Partial<AdminCategory> }) =>
      productService.updateCategory(slug, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category updated successfully");
    },
    onError: (err) => {
      toast.error(`Failed to update category: ${(err as Error).message}`);
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => productService.deleteCategory(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category deleted successfully");
    },
    onError: (err) => {
      toast.error(`Failed to delete category: ${(err as Error).message}`);
    },
  });
}
