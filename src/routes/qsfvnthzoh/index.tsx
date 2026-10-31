import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Wallet,
  ShoppingCart,
  Package,
  Users,
  Boxes,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminPageHeader } from "@/components/admin/AdminLayout";
import { MetricCard, SectionCard, StatusPill } from "@/components/admin/parts";
import { useDashboardStatsQuery } from "@/hooks/queries/useDashboardStatsQuery";
import { Loader } from "@/components/ui/loader";
import { salesSeries } from "@/lib/admin-data";
import { formatNaira } from "@/lib/mock-data";
import { formatCompactNaira } from "@/routes/qsfvnthzoh/analytics";

export const Route = createFileRoute("/qsfvnthzoh/")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — EIMAH Admin" },
      { name: "description", content: "EIMAH admin overview." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStatsQuery();

  if (isLoading) {
    return (
      <div>
        <AdminPageHeader title="Dashboard" />
        <div className="min-h-[480px] flex items-center justify-center">
          <Loader size="lg" label="Loading dashboard metrics..." />
        </div>
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const totalProducts = stats?.totalProducts ?? 0;
  const totalCustomers = stats?.totalCustomers ?? 0;
  const totalSold = stats?.totalSold ?? 0;
  const totalProfit = stats?.totalProfit ?? 0;

  const topProducts = (stats?.topProducts ?? []).map((p: any) => ({
    ...p,
    images:
      Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : [
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
          ],
  }));

  const recentOrders = (stats?.recentOrders ?? []).map((o: any) => ({
    id: o.id || "EMH-00000",
    customer: o.customer || "Customer",
    email: o.email || "",
    date: o.date || new Date().toISOString(),
    status: o.status || "Paid",
    total: Number(o.total || 0),
  }));

  const topCategories =
    stats?.topCategories && stats.topCategories.length > 0
      ? stats.topCategories
      : [
          { name: "Clothing", value: 3840000 },
          { name: "Shoes", value: 2420000 },
          { name: "Bags", value: 1980000 },
          { name: "Home Essentials", value: 1450000 },
          { name: "Gadgets", value: 920000 },
        ];

  const revenueChartData =
    stats?.monthlyRevenue && stats.monthlyRevenue.length > 0
      ? stats.monthlyRevenue
      : salesSeries;

  const CAT_COLORS = ["#F590DD", "#7CF9CE", "#CAFF75", "#FFE784", "#0a0a0a"];

  return (
    <div>
      <AdminPageHeader title="Dashboard" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          label="Total Revenue"
          value={formatNaira(totalRevenue)}
          delta="+12.4%"
          icon={<Wallet className="size-4" />}
          tint="bg-brand-pink/20"
        />
        <MetricCard
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          delta="+8.1%"
          icon={<ShoppingCart className="size-4" />}
          tint="bg-brand-mint/40"
        />
        <MetricCard
          label="Total Products"
          value={totalProducts.toString()}
          delta="+3 new"
          icon={<Package className="size-4" />}
          tint="bg-brand-lime/40"
        />
        <MetricCard
          label="Total Customers"
          value={totalCustomers.toLocaleString()}
          delta="+5.6%"
          icon={<Users className="size-4" />}
          tint="bg-brand-yellow/50"
        />
        <MetricCard
          label="Products Sold"
          value={totalSold.toLocaleString()}
          delta="+14.2%"
          icon={<Boxes className="size-4" />}
          tint="bg-secondary"
        />
        <MetricCard
          label="Total Profit"
          value={formatNaira(totalProfit)}
          delta="+9.8%"
          icon={<TrendingUp className="size-4" />}
          tint="bg-brand-pink/20"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3 mt-6">
        <SectionCard
          title="Revenue Analytics"
          action={
            <span className="text-xs text-muted-foreground">This Year</span>
          }
          className="xl:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eee" />
                <XAxis dataKey="m" stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#999"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={formatCompactNaira}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #eee", fontSize: 12 }}
                  formatter={(v: any) => [formatNaira(Number(v)), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#0a0a0a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Top Categories"
          action={
            <Link
              to="/qsfvnthzoh/analytics"
              className="text-xs font-semibold inline-flex items-center gap-1 hover:text-brand-pink"
            >
              View <ArrowUpRight className="size-3" />
            </Link>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topCategories}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {topCategories.map((_, i) => (
                    <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => [formatNaira(Number(v)), "Revenue"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #eee", fontSize: 12 }}
                />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3 mt-6">
        <SectionCard
          title="Recent Orders"
          action={
            <Link
              to="/qsfvnthzoh/orders"
              className="text-xs font-semibold inline-flex items-center gap-1 hover:text-brand-pink whitespace-nowrap shrink-0"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          }
          className="xl:col-span-2 p-0 overflow-hidden"
        >
          {/* Mobile Card View */}
          <div className="sm:hidden p-4 space-y-3">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-xl border border-border bg-white shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-muted-foreground">
                    {o.id}
                  </span>
                  <StatusPill value={o.status} />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{o.customer}</p>
                    <p className="text-xs text-muted-foreground">{o.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-foreground">{formatNaira(o.total)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(o.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Aligned Table View */}
          <div className="hidden sm:block overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="py-3.5 px-4 text-left whitespace-nowrap">ID</th>
                  <th className="py-3.5 px-4 text-left">Customer</th>
                  <th className="py-3.5 px-4 text-left whitespace-nowrap">Date</th>
                  <th className="py-3.5 px-4 text-left whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {o.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-sm text-foreground">{o.customer}</p>
                      <p className="text-xs text-muted-foreground">{o.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(o.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusPill value={o.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-foreground whitespace-nowrap">
                      {formatNaira(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Top-Performing Products"
          action={
            <Link
              to="/qsfvnthzoh/products"
              className="text-xs font-semibold inline-flex items-center gap-1 hover:text-brand-pink"
            >
              View <ArrowUpRight className="size-3" />
            </Link>
          }
        >
          <ul className="space-y-3">
            {topProducts.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-md overflow-hidden bg-surface-2 shrink-0">
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sold} sold</p>
                </div>
                <p className="text-sm font-semibold whitespace-nowrap">{formatNaira(p.price)}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
