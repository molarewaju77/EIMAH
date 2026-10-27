import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentService } from "@/services/contentService";
import type { Banner, Popup, Solution, SolutionPayment } from "@/lib/admin-data";
import { toast } from "react-toastify";

// ── Banners ──────────────────────────────────────────────────
export const BANNERS_QUERY_KEY = ["banners"];

export function useBannersQuery() {
  return useQuery({
    queryKey: BANNERS_QUERY_KEY,
    queryFn: () => contentService.getBanners(),
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (banner: Banner) => contentService.createBanner(banner),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
      toast.success("Banner created successfully");
    },
    onError: (err) => {
      toast.error(`Failed to create banner: ${(err as Error).message}`);
    },
  });
}

export function useUpdateBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Banner> }) =>
      contentService.updateBanner(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
      toast.success("Banner updated successfully");
    },
    onError: (err) => {
      toast.error(`Failed to update banner: ${(err as Error).message}`);
    },
  });
}

export function useDeleteBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
      toast.success("Banner deleted successfully");
    },
    onError: (err) => {
      toast.error(`Failed to delete banner: ${(err as Error).message}`);
    },
  });
}

// ── Popups ───────────────────────────────────────────────────
export const POPUPS_QUERY_KEY = ["popups"];

export function usePopupsQuery() {
  return useQuery({
    queryKey: POPUPS_QUERY_KEY,
    queryFn: () => contentService.getPopups(),
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreatePopupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (popup: Popup) => contentService.createPopup(popup),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POPUPS_QUERY_KEY });
      toast.success("Popup announcement created");
    },
    onError: (err) => {
      toast.error(`Failed to create popup: ${(err as Error).message}`);
    },
  });
}

export function useUpdatePopupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Popup> }) =>
      contentService.updatePopup(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POPUPS_QUERY_KEY });
      toast.success("Popup announcement updated");
    },
    onError: (err) => {
      toast.error(`Failed to update popup: ${(err as Error).message}`);
    },
  });
}

export function useDeletePopupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentService.deletePopup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POPUPS_QUERY_KEY });
      toast.success("Popup announcement deleted");
    },
    onError: (err) => {
      toast.error(`Failed to delete popup: ${(err as Error).message}`);
    },
  });
}

// ── Solutions ────────────────────────────────────────────────
export const SOLUTIONS_QUERY_KEY = ["solutions"];

export function useSolutionsQuery() {
  return useQuery({
    queryKey: SOLUTIONS_QUERY_KEY,
    queryFn: () => contentService.getSolutions(),
    staleTime: 1000 * 60 * 3,
  });
}

export function useSolutionItemQuery(idOrTitle: string) {
  const { data: solutions = [], ...rest } = useSolutionsQuery();
  const solution = solutions.find(
    (s) => s.id === idOrTitle || s.title.toLowerCase().includes(idOrTitle.toLowerCase())
  );
  return { solution, solutions, ...rest };
}

export function useUpdateSolutionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Solution> }) =>
      contentService.updateSolution(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOLUTIONS_QUERY_KEY });
      toast.success("Solution package updated");
    },
    onError: (err) => {
      toast.error(`Failed to update solution: ${(err as Error).message}`);
    },
  });
}

// ── Solution Payments ────────────────────────────────────────
export const SOLUTION_PAYMENTS_QUERY_KEY = ["solution_payments"];

export function useSolutionPaymentsQuery() {
  return useQuery({
    queryKey: SOLUTION_PAYMENTS_QUERY_KEY,
    queryFn: () => contentService.getSolutionPayments(),
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
  });
}

export function usePaginatedSolutionPaymentsQuery(params: import("@/lib/db/content").SolutionPaymentQueryParams = {}) {
  return useQuery({
    queryKey: [...SOLUTION_PAYMENTS_QUERY_KEY, "paginated", params],
    queryFn: () => contentService.getPaginatedSolutionPayments(params),
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateSolutionPaymentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SolutionPayment["status"] }) =>
      contentService.updateSolutionPaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOLUTION_PAYMENTS_QUERY_KEY });
      toast.success("Payment status updated");
    },
    onError: (err) => {
      toast.error(`Failed to update status: ${(err as Error).message}`);
    },
  });
}
