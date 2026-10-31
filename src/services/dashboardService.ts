import { supabase } from "@/lib/supabase";
import type { AdminProduct, AdminOrder } from "@/lib/admin-data";

export type MonthlyRevenuePoint = {
  m: string;
  revenue: number;
  orders: number;
};

export type CategoryRevenuePoint = {
  name: string;
  value: number;
};

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalSold: number;
  totalProfit: number;
  recentOrders: Partial<AdminOrder>[];
  topProducts: Partial<AdminProduct>[];
  monthlyRevenue?: MonthlyRevenuePoint[];
  topCategories?: CategoryRevenuePoint[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getLocalFallbackStats(): DashboardStats {
  return {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalSold: 0,
    totalProfit: 0,
    recentOrders: [],
    topProducts: [],
    monthlyRevenue: MONTHS.map((m) => ({
      m,
      revenue: 0,
      orders: 0,
    })),
    topCategories: [],
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
