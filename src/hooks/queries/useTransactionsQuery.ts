import { useQuery } from "@tanstack/react-query";
import { contentService } from "@/services/contentService";
import type { TransactionQueryParams } from "@/lib/db/content";

export const TRANSACTIONS_QUERY_KEY = ["transactions"];

export function useTransactionsQuery() {
  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: () => contentService.getTransactions(),
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
  });
}

export function usePaginatedTransactionsQuery(params: TransactionQueryParams = {}) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, "paginated", params],
    queryFn: () => contentService.getPaginatedTransactions(params),
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
  });
}
