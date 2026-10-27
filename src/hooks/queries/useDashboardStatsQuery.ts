import { useQuery } from "@tanstack/react-query";
import { dashboardService, type DashboardStats } from "@/services/dashboardService";

export const DASHBOARD_STATS_KEY = ["admin-dashboard-stats"];

export function useDashboardStatsQuery() {
  return useQuery<DashboardStats>({
    queryKey: DASHBOARD_STATS_KEY,
    queryFn: () => dashboardService.getStats(),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });
}
