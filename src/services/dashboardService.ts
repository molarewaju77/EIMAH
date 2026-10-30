import { supabase } from "@/lib/supabase";
import {
  adminProducts,
  adminOrders,
  adminCustomers,
  salesSeries,
  type AdminProduct,
  type AdminOrder,
} from "@/lib/admin-data";

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
    monthlyRevenue: salesSeries.map((s) => ({
      m: s.m,
      revenue: s.revenue * 1000000,
      orders: s.orders,
    })),
    topCategories: [
      { name: "Clothing", value: 3840000 },
      { name: "Shoes", value: 2420000 },
      { name: "Bags", value: 1980000 },
      { name: "Home Essentials", value: 1450000 },
      { name: "Gadgets", value: 920000 },
    ],
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
