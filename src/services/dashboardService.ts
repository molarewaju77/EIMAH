import { supabase } from "@/lib/supabase";
import { adminProducts, adminOrders, adminCustomers, type AdminProduct, type AdminOrder } from "@/lib/admin-data";

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalSold: number;
  totalProfit: number;
  recentOrders: Partial<AdminOrder>[];
  topProducts: Partial<AdminProduct>[];
};

function getLocalFallbackStats(): DashboardStats {
  const totalRev = adminOrders.reduce((n, o) => n + o.total, 0);
  return {
    totalRevenue: totalRev,
    totalOrders: adminOrders.length,
    totalProducts: adminProducts.length,
    totalCustomers: adminCustomers.length,
    totalSold: adminProducts.reduce((n, p) => n + p.sold, 0),
    totalProfit: Math.round(totalRev * 0.34),
    recentOrders: adminOrders.slice(0, 6),
    topProducts: [...adminProducts].sort((a, b) => b.sold - a.sold).slice(0, 5),
  };
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const { data, error } = await supabase.rpc("get_admin_dashboard_stats");
      if (error || !data) {
        return getLocalFallbackStats();
      }
      return data as DashboardStats;
    } catch {
      return getLocalFallbackStats();
    }
  },
};
