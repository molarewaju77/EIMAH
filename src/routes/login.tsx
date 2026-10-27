import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowRight, UserCheck, LogOut, Package, Heart, ShoppingBag } from "lucide-react";
import { useCustomerAuth } from "@/lib/customer-store";
import { useCartDrawer } from "@/lib/cart-drawer-store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login — EIMAH" },
      { name: "description", content: "Login to your EIMAH account." },
    ],
  }),
});

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("M@gmail.com");
  const [password, setPassword] = useState("12345");
  const [fullName, setFullName] = useState("Michael Oladimeji");

  const { user, isAuthed, login, logout } = useCustomerAuth();
  const nav = useNavigate();
  const openDrawer = useCartDrawer((s) => s.openDrawer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = login(email, password);
      if (success) {
        nav({ to: "/shop" });
      }
    } else {
      const success = login(email, password);
      if (success) {
        nav({ to: "/shop" });
      }
    }
  };

  const handleFillDemo = () => {
    setEmail("M@gmail.com");
    setPassword("12345");
  };

  return (
    <SiteLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-surface border border-border/60 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle brand accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-pink" />

          {isAuthed && user ? (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-brand-pink text-ink font-display font-bold text-2xl grid place-items-center mx-auto shadow-md">
                {user.initials}
              </div>

              <div>
                <h1 className="font-display font-bold text-2xl text-foreground">
                  Welcome, {user.name}!
                </h1>
                <p className="text-muted-foreground mt-1 text-sm font-mono">
                  {user.email}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                  <UserCheck className="size-3.5" />
                  <span>Logged in successfully</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <Link
                  to="/shop"
                  className="w-full h-11 bg-ink text-white font-display font-semibold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="size-4" />
                  <span>Continue Shopping</span>
                </Link>

                <Link
                  to="/track"
                  className="w-full h-11 bg-surface-2 border border-border text-foreground font-display font-semibold rounded-xl hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="size-4" />
                  <span>Track My Orders</span>
                </Link>

                <Link
                  to="/wishlist"
                  className="w-full h-11 bg-surface-2 border border-border text-foreground font-display font-semibold rounded-xl hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className="size-4" />
                  <span>My Wishlist</span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="w-full h-11 border border-destructive/30 text-destructive font-display font-semibold rounded-xl hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="font-display font-bold text-3xl text-ink">
                  {isLogin ? "Welcome back" : "Create account"}
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  {isLogin
                    ? "Enter your details to access your account."
                    : "Sign up to start shopping faster and track orders."}
                </p>
              </div>

              {/* Demo Credentials Quick Pill */}
              <div className="mb-6 p-3 rounded-xl bg-brand-pink/10 border border-brand-pink/30 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-ink">Demo Login: </span>
                  <span className="font-mono text-ink/90">M@gmail.com</span> / <span className="font-mono text-ink/90">12345</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-2.5 py-1 rounded-md bg-brand-pink text-ink font-semibold hover:bg-brand-pink/80 transition-colors shrink-0 cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                      placeholder="Michael Oladimeji"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                    placeholder="M@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-ink">Password</label>
                    {isLogin && (
                      <span className="text-xs text-brand-pink font-medium select-none">
                        Default: 12345
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-6 bg-ink text-white font-display font-semibold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 group cursor-pointer shadow-md"
                >
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-brand-pink font-semibold hover:underline cursor-pointer"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
