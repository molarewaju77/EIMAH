import { Link, useRouterState } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Megaphone,
  Briefcase,
  FileText,
  CreditCard,
  Settings,
  FileDown,
  LogOut,
  Menu,
  X,
  Truck,
  Store,
  ChevronDown,
} from "lucide-react";
import logoUrl from "@/assets/eimah-logo.svg";
import { useAdminAuth, isClientAuthed } from "@/lib/admin-store";
import { cn } from "@/lib/utils";

type NavSubItem = {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
};

type NavItem = {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
  children?: NavSubItem[];
};

const NAV_ITEMS: NavItem[] = [
  { to: "/qsfvnthzoh", label: "Dashboard", icon: LayoutGrid, exact: true },
  { to: "/qsfvnthzoh/products", label: "Products", icon: Package },
  {
    to: "/qsfvnthzoh/orders",
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { to: "/qsfvnthzoh/orders", label: "Courier Orders", icon: Truck, exact: true },
      { to: "/qsfvnthzoh/orders/pickup", label: "Pick-up Orders", icon: Store },
    ],
  },
  { to: "/qsfvnthzoh/pos", label: "Create Order (POS)", icon: ShoppingCart },
  { to: "/qsfvnthzoh/customers", label: "Customers", icon: Users },
  { to: "/qsfvnthzoh/categories", label: "Categories", icon: Tag },
  { to: "/qsfvnthzoh/applications", label: "Applications", icon: FileText },
  { to: "/qsfvnthzoh/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/qsfvnthzoh/content", label: "Content Management", icon: Megaphone },
  { to: "/qsfvnthzoh/transactions", label: "Transactions", icon: CreditCard },
  /*
  {
    to: "/qsfvnthzoh/payments",
    label: "Payments",
    icon: CreditCard,
    children: [
      { to: "/qsfvnthzoh/payments", label: "Orders Payments", icon: ShoppingCart, exact: true },
      { to: "/qsfvnthzoh/payments/solutions", label: "Solutions Payments", icon: Briefcase },
    ],
  },
  */
  { to: "/qsfvnthzoh/reports", label: "Reports & Exports", icon: FileDown },
  { to: "/qsfvnthzoh/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const { isAuthed, admin, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!isClientAuthed()) {
      nav({ to: "/qsfvnthzoh/login", replace: true });
    }
  }, [pathname, nav]);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (!isClientAuthed()) {
    return null;
  }

  const onLogout = () => {
    logout();
    nav({ to: "/qsfvnthzoh/login" });
  };
  return (
    <div className="min-h-screen bg-[#f6f6f4] text-foreground flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-52 bg-white border-r border-border flex-col z-40">
        <SidebarInner onLogout={onLogout} pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[60] transition-opacity",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-ink/40"
        />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-[85%] max-w-xs bg-white flex flex-col shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarInner
            onLogout={onLogout}
            pathname={pathname}
            onCloseMobile={() => setMobileOpen(false)}
            showClose
          />
        </aside>
      </div>

      {/* Main */}
      <div className="flex-1 lg:pl-52 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-border h-14 flex items-center justify-between px-4">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 -ml-2 rounded-md hover:bg-secondary"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display font-semibold text-sm text-foreground truncate px-2">
            {ROUTE_TITLES[pathname] || getHeaderCrumbs(pathname).pop()?.label || "Dashboard"}
          </span>
          <div
            className="w-9 h-9 rounded-full grid place-items-center text-sm font-semibold text-ink shrink-0"
            style={{ background: admin?.avatarBg }}
          >
            {admin?.name.charAt(0) ?? "A"}
          </div>
        </div>

        {/* Mobile Breadcrumb (After Navbar) */}
        <div className="lg:hidden px-4 sm:px-6 pt-3 pb-1">
          {pathname === "/qsfvnthzoh" || pathname === "/qsfvnthzoh/" ? (
            <span className="font-display font-medium text-xs text-foreground">Dashboard</span>
          ) : (
            <nav className="flex items-center gap-1.5 text-xs font-display tracking-tight flex-wrap">
              {getHeaderCrumbs(pathname).map((c, i, arr) => {
                const isLast = i === arr.length - 1;
                return (
                  <span key={i} className="inline-flex items-center gap-1.5">
                    {c.to && !isLast ? (
                      <Link
                        to={c.to}
                        className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        {c.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          isLast
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground font-medium",
                        )}
                      >
                        {c.label}
                      </span>
                    )}
                    {!isLast && (
                      <span className="text-brand-pink font-bold text-xs select-none">»</span>
                    )}
                  </span>
                );
              })}
            </nav>
          )}
        </div>

        {/* Global Desktop Header */}
        <GlobalAdminHeader pathname={pathname} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-6 pt-1.5 sm:pt-3 lg:pt-3">{children}</main>
      </div>
    </div>
  );
}

function SidebarInner({
  onLogout,
  pathname,
  showClose,
  onCloseMobile,
}: {
  onLogout: () => void;
  pathname: string;
  showClose?: boolean;
  onCloseMobile?: () => void;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "/qsfvnthzoh/orders": true,
    "/qsfvnthzoh/payments": true,
  });

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        <Link to="/qsfvnthzoh" className="flex items-center">
          <img src={logoUrl} alt="EIMAH" className="h-5 w-auto" />
        </Link>
        {showClose && (
          <button onClick={onCloseMobile} aria-label="Close" className="p-2 -mr-2">
            <X className="size-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            if (item.children && item.children.length > 0) {
              const isChildActive = item.children.some((c) => isActive(c.to, c.exact));
              const isOpen = openGroups[item.to] ?? isChildActive;

              return (
                <li key={item.to} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.to)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-2.5 h-9 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                      isChildActive
                        ? "text-foreground font-semibold bg-secondary/80"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          "grid place-items-center h-6 w-6 rounded-md transition-colors shrink-0",
                          isChildActive ? "bg-brand-pink/20 text-ink" : "bg-transparent",
                        )}
                      >
                        <item.icon className="size-3.5" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-3.5 text-muted-foreground transition-transform duration-200",
                        isOpen ? "rotate-180" : "",
                      )}
                    />
                  </button>

                  {isOpen && (
                    <ul className="pl-4 pr-1 py-0.5 space-y-0.5 border-l-2 border-border/60 ml-5 my-0.5">
                      {item.children.map((child) => {
                        const childActive = isActive(child.to, child.exact);
                        return (
                          <li key={child.to}>
                            <Link
                              to={child.to}
                              className={cn(
                                "flex items-center gap-2 px-2 h-8 rounded-lg text-[11px] font-medium transition-colors",
                                childActive
                                  ? "bg-brand-pink/15 text-ink font-semibold"
                                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                              )}
                            >
                              <child.icon className="size-3 shrink-0" />
                              <span className="truncate">{child.label}</span>
                              {childActive && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-pink shrink-0" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            const active = isActive(item.to, "exact" in item ? item.exact : false);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-xs font-medium transition-colors",
                    active
                      ? "bg-brand-pink/15 text-ink font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "grid place-items-center h-6 w-6 rounded-md transition-colors shrink-0",
                      active ? "bg-brand-pink text-ink" : "bg-transparent",
                    )}
                  >
                    <item.icon className="size-3.5" />
                  </span>
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-pink shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-2.5 border-t border-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
        >
          <span className="grid place-items-center h-6 w-6 rounded-md shrink-0">
            <LogOut className="size-3.5" />
          </span>
          Log out
        </button>
      </div>
    </>
  );
}

// ---------- Page header ----------

// ---------- Global Header ----------

const ROUTE_TITLES: Record<string, string> = {
  "/qsfvnthzoh": "Dashboard",
  "/qsfvnthzoh/products": "Products",
  "/qsfvnthzoh/orders": "Courier Orders",
  "/qsfvnthzoh/orders/pickup": "Pick-up Orders",
  "/qsfvnthzoh/pos": "Create Order (POS)",
  "/qsfvnthzoh/customers": "Customers",
  "/qsfvnthzoh/deliveries": "Deliveries",
  "/qsfvnthzoh/categories": "Categories",
  "/qsfvnthzoh/solutions": "Solutions",
  "/qsfvnthzoh/analytics": "Analytics",
  "/qsfvnthzoh/content": "Content Management",
  "/qsfvnthzoh/transactions": "Transactions",
  "/qsfvnthzoh/payments": "Orders Payments",
  "/qsfvnthzoh/payments/solutions": "Solutions Payments",
  "/qsfvnthzoh/reports": "Reports & Exports",
  "/qsfvnthzoh/settings": "Settings",
};

function getHeaderCrumbs(pathname: string): { label: string; to?: string }[] {
  if (pathname === "/qsfvnthzoh" || pathname === "/qsfvnthzoh/") {
    return [{ label: "Dashboard" }];
  }

  const title = ROUTE_TITLES[pathname];
  if (title) {
    return [{ label: "Dashboard", to: "/qsfvnthzoh" }, { label: title }];
  }

  const cleanPath = pathname.replace(/\/$/, "");

  // Special handling for solutions payments
  if (cleanPath.startsWith("/qsfvnthzoh/payments/solutions")) {
    return [
      { label: "Dashboard", to: "/qsfvnthzoh" },
      { label: "Payments", to: "/qsfvnthzoh/payments" },
      { label: "Solutions Payments" },
    ];
  }

  // Special handling for solutions
  if (cleanPath.startsWith("/qsfvnthzoh/solutions/")) {
    const solutionId = cleanPath.split("/").pop() || "";
    return [
      { label: "Dashboard", to: "/qsfvnthzoh" },
      { label: "Solutions", to: "/qsfvnthzoh/solutions" },
      { label: solutionId },
    ];
  }

  // Special handling for pick-up orders
  if (cleanPath.startsWith("/qsfvnthzoh/orders/pickup/")) {
    const orderId = cleanPath.split("/").pop() || "";
    return [
      { label: "Dashboard", to: "/qsfvnthzoh" },
      { label: "Pick-up Orders", to: "/qsfvnthzoh/orders/pickup" },
      { label: orderId },
    ];
  }

  // Special handling for courier orders
  if (cleanPath.startsWith("/qsfvnthzoh/orders/")) {
    const orderId = cleanPath.split("/").pop() || "";
    return [
      { label: "Dashboard", to: "/qsfvnthzoh" },
      { label: "Courier Orders", to: "/qsfvnthzoh/orders" },
      { label: orderId },
    ];
  }

  const parts = cleanPath.split("/").filter(Boolean);
  const crumbs: { label: string; to?: string }[] = [{ label: "Dashboard", to: "/qsfvnthzoh" }];

  if (parts.length > 1) {
    let acc = "/qsfvnthzoh";
    for (let i = 1; i < parts.length; i++) {
      acc += `/${parts[i]}`;
      const label =
        ROUTE_TITLES[acc] || parts[i].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({
        label,
        to: i === parts.length - 1 ? undefined : acc,
      });
    }
  }
  return crumbs;
}

function GlobalAdminHeader({ pathname }: { pathname: string }) {
  const admin = useAdminAuth((s) => s.admin);
  const crumbs = getHeaderCrumbs(pathname);
  const isDashboard = pathname === "/qsfvnthzoh" || pathname === "/qsfvnthzoh/";

  return (
    <header className="hidden lg:flex items-center justify-between gap-4 px-8 pt-6 pb-2">
      <div className="min-w-0">
        {isDashboard ? (
          <h1 className="font-display font-medium text-sm text-foreground">Dashboard</h1>
        ) : (
          <nav className="flex items-center gap-1.5 text-sm font-display tracking-tight flex-wrap">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <span key={i} className="inline-flex items-center gap-1.5">
                  {c.to && !isLast ? (
                    <Link
                      to={c.to}
                      className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        isLast
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground font-medium",
                      )}
                    >
                      {c.label}
                    </span>
                  )}
                  {!isLast && (
                    <span className="text-muted-foreground/60 text-xs font-semibold select-none">
                      »
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        )}
      </div>

      {admin && (
        <div className="flex items-center gap-3">
          <div className="text-left leading-tight">
            <p className="font-display font-semibold text-sm">{admin.name}</p>
            <p className="text-xs text-muted-foreground">{admin.role}</p>
          </div>
          <div
            className="grid place-items-center h-9 w-9 rounded-full text-xs font-semibold text-ink shrink-0"
            style={{ background: admin.avatarBg }}
          >
            {admin.name.charAt(0)}
          </div>
        </div>
      )}
    </header>
  );
}

// Deprecated page header component maintained for backwards compatibility
export function AdminPageHeader({
  actions,
}: {
  title?: string;
  crumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  if (actions) {
    return <div className="flex items-center justify-end mb-4">{actions}</div>;
  }
  return null;
}
