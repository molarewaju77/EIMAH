import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Menu,
  ShoppingBag,
  User,
  UserX,
  X,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  UserCheck,
} from "lucide-react";
import logoUrl from "@/assets/eimah-logo.svg";
import logoWhiteUrl from "@/assets/eimah-logo-white.svg";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useCartDrawer } from "@/lib/cart-drawer-store";
import { useCustomerAuth } from "@/lib/customer-store";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Solutions", to: "/solutions" },
  { label: "Track Order", to: "/track" },
  { label: "Contact", to: "/contact" },
];

export function Header({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const wishlistCount = useWishlist((s) => s.items.length);
  const openDrawer = useCartDrawer((s) => s.openDrawer);
  const { user, isAuthed, logout } = useCustomerAuth();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const unsub = router.subscribe("onResolved", () => {
      setOpen(false);
      setUserDropdownOpen(false);
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  const clear = transparentOnTop && !scrolled;
  const activeLogo = clear ? logoWhiteUrl : logoUrl;

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  };

  return (
    <>
      <header
        className={cn(
          "sticky inset-x-0 top-0 z-50 transition-all duration-300",
          clear ? "bg-transparent" : "bg-background/80 backdrop-blur-xl border-b border-border/60",
        )}
      >
        <div className="container-eimah flex h-16 md:h-20 items-center justify-between gap-4">
          {/* Left: Mobile menu & Desktop Logo */}
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <button
              onClick={() => setOpen(true)}
              className={cn(
                "md:hidden -ml-2 p-2 rounded-md",
                clear ? "text-white hover:bg-white/10" : "hover:bg-secondary",
              )}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>

            <Link
              to="/"
              className="hidden md:block shrink-0"
              aria-label="EIMAH home"
              onClick={handleHomeClick}
            >
              <img
                src={activeLogo}
                className="h-8 w-auto object-contain transition-all duration-300 -mt-1.5"
                alt="EIMAH"
              />
            </Link>
          </div>

          {/* Center: Desktop Nav & Mobile Logo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <Link
              to="/"
              className="md:hidden shrink-0"
              aria-label="EIMAH home"
              onClick={handleHomeClick}
            >
              <img
                src={activeLogo}
                className="h-7 w-auto object-contain transition-all duration-300 -mt-1.5"
                alt="EIMAH"
              />
            </Link>
            <nav className="hidden md:flex items-center justify-center gap-7 text-sm font-medium">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => {
                    if (n.to === "/") {
                      handleHomeClick();
                    }
                  }}
                  className={cn(
                    "transition-colors hover:opacity-70",
                    clear ? "text-white" : "text-foreground",
                  )}
                  activeProps={{
                    className:
                      "opacity-100 [text-decoration:underline] [text-underline-offset:6px] [text-decoration-thickness:2px]",
                  }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-5">
            {/* Desktop Wishlist */}
            <Link
              to="/wishlist"
              className={cn(
                "hidden md:inline-flex items-center gap-1.5 transition-colors cursor-pointer text-sm font-medium",
                clear ? "text-white hover:opacity-70" : "text-foreground hover:opacity-70",
              )}
              aria-label="Wishlist"
            >
              <Heart className="size-4 text-current" />
              <span>Wishlist</span>
              <span className="text-xs font-semibold">[{wishlistCount}]</span>
            </Link>

            {/* User Account / Profile Dropdown (Desktop view) - Currently commented out
            {isAuthed && user ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={cn(
                    "flex h-9 pl-1.5 pr-2.5 rounded-full items-center gap-2 border transition-all cursor-pointer",
                    clear
                      ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      : "bg-surface border-border hover:border-brand-pink text-foreground shadow-2xs",
                  )}
                  aria-label="User account menu"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-pink text-ink font-display font-bold text-xs grid place-items-center shrink-0">
                    {user.initials}
                  </div>
                  <span className="text-xs font-semibold max-w-[90px] truncate">
                    {user.shortName}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3 text-muted-foreground transition-transform duration-200",
                      userDropdownOpen ? "rotate-180" : "",
                    )}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-border/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-foreground">
                    <div className="px-3 py-2.5 border-b border-border/60">
                      <p className="text-[11px] text-muted-foreground font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-ink truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1.5 space-y-0.5 text-xs font-medium">
                      <Link
                        to="/track"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary text-foreground transition-colors"
                      >
                        <Package className="size-4 text-muted-foreground" />
                        <span>Track My Orders</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary text-foreground transition-colors"
                      >
                        <Heart className="size-4 text-muted-foreground" />
                        <span>My Wishlist ({wishlistCount})</span>
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openDrawer();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary text-foreground transition-colors text-left cursor-pointer"
                      >
                        <ShoppingBag className="size-4 text-muted-foreground" />
                        <span>Shopping Cart ({count})</span>
                      </button>
                    </div>

                    <div className="pt-1.5 border-t border-border/60">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-xs font-semibold text-left cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={cn(
                  "hidden md:inline-flex p-2 rounded-md",
                  clear ? "text-white hover:bg-white/10" : "hover:bg-secondary",
                )}
                aria-label="Account"
              >
                <UserX className="size-[18px]" />
              </Link>
            )}
            */}

            {/* Desktop Cart */}
            <button
              onClick={openDrawer}
              className={cn(
                "hidden md:inline-flex items-center gap-1.5 transition-colors cursor-pointer text-sm font-medium",
                clear ? "text-white hover:opacity-70" : "text-foreground hover:opacity-70",
              )}
              aria-label="Cart"
            >
              <ShoppingBag className="size-4 text-current" />
              <span>Cart</span>
              <span className="text-xs font-semibold">[{count}]</span>
            </button>

            {/* Mobile Cart Icon Button */}
            <button
              onClick={openDrawer}
              className={cn(
                "md:hidden relative p-2 rounded-md",
                clear ? "text-white hover:bg-white/10" : "hover:bg-secondary",
              )}
              aria-label="Cart"
            >
              <ShoppingBag className="size-[18px]" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-pink text-[10px] font-semibold text-ink grid place-items-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] md:hidden transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-[86%] max-w-sm bg-background shadow-2xl transition-transform duration-300 flex flex-col",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-border">
            <Link
              to="/"
              className="shrink-0"
              aria-label="EIMAH home"
              onClick={() => {
                setOpen(false);
                handleHomeClick();
              }}
            >
              <img src={logoUrl} className="h-6 w-auto object-contain" alt="EIMAH" />
            </Link>
            <button onClick={() => setOpen(false)} className="p-2 -mr-2" aria-label="Close">
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-5 flex flex-col gap-1.5">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{
                  className: "text-brand-pink font-bold bg-brand-pink/10 px-3.5",
                }}
                inactiveProps={{
                  className: "text-foreground hover:text-brand-pink px-3.5",
                }}
                onClick={() => {
                  setOpen(false);
                  if (n.to === "/") {
                    handleHomeClick();
                  }
                }}
                className="py-3 text-2xl font-display font-semibold tracking-tight flex items-center justify-between transition-all rounded-xl"
              >
                {({ isActive }) => (
                  <>
                    <span>{n.label}</span>
                    {isActive && (
                      <span className="text-brand-pink text-lg font-bold select-none">»</span>
                    )}
                  </>
                )}
              </Link>
            ))}
            <div className="h-px bg-border my-4" />
            <button
              onClick={() => {
                setOpen(false);
                openDrawer();
              }}
              className="py-2.5 px-3.5 rounded-lg text-sm text-muted-foreground hover:text-foreground flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <span>Shopping Cart</span>
              {count > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-pink text-xs font-bold text-ink grid place-items-center">
                  {count}
                </span>
              )}
            </button>
            <Link
              to="/wishlist"
              activeProps={{ className: "text-brand-pink font-semibold bg-brand-pink/10" }}
              className="py-2.5 px-3.5 rounded-lg text-sm text-muted-foreground hover:text-foreground flex items-center justify-between transition-colors"
            >
              <span>My Wishlist</span>
              {wishlistCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-pink text-xs font-bold text-ink grid place-items-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Bottom Profile / Account Section - Currently commented out
          <div className="p-4 border-t border-border bg-surface/50">
            {isAuthed && user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-brand-pink text-ink font-display font-bold text-sm grid place-items-center shrink-0 shadow-2xs">
                    {user.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user.shortName}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-secondary/80 border border-border/80 text-muted-foreground grid place-items-center shrink-0 shadow-2xs">
                    <UserX className="size-5 text-muted-foreground/80" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Guest User</p>
                    <p className="text-xs text-muted-foreground">Not signed in</p>
                  </div>
                </div>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-ink text-white font-display font-semibold text-xs hover:bg-black transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <User className="size-3.5" />
                  <span>Log in</span>
                </Link>
              </div>
            )}
          </div>
          */}
        </aside>
      </div>
    </>
  );
}
