import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import logoUrl from "@/assets/eimah-logo.svg";
import { useAdminAuth, isClientAuthed } from "@/lib/admin-store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/qsfvnthzoh_/login")({
  ssr: false,
  beforeLoad: () => {
    if (isClientAuthed()) {
      throw redirect({
        to: "/qsfvnthzoh",
      });
    }
  },
  component: AdminLogin,
  head: () => ({
    meta: [
      { title: "Admin Login EIMAH" },
      { name: "description", content: "Sign in to the EIMAH administration console." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminLogin() {
  const nav = useNavigate();
  const { login, isAuthed } = useAdminAuth();
  const isAuthedNow = isAuthed || isClientAuthed();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isClientAuthed()) {
      nav({ to: "/qsfvnthzoh", replace: true });
    }
  }, [nav]);

  if (isAuthedNow) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@") || password.length < 6) {
      setError("Enter a valid email and password (6+ characters).");
      return;
    }
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError || !data?.user) {
        setError(
          authError?.message || "Invalid login credentials. Please check your email and password.",
        );
        toast.error(authError?.message || "Login failed");
        return;
      }

      const userName =
        data.user.user_metadata?.full_name ||
        data.user.email
          ?.split("@")[0]
          .replace(/\./g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()) ||
        "Administrator";

      login(email.trim(), userName);
      toast.success(`Welcome back, ${userName}!`);
      nav({ to: "/qsfvnthzoh" });
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign in.");
      toast.error("Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: form */}
      <div className="flex flex-col p-6 md:p-10">
        <Link to="/" className="inline-flex">
          <img src={logoUrl} alt="EIMAH" className="h-7 w-auto" />
        </Link>

        <div className="flex-1 grid place-items-center">
          <div className="w-full max-w-sm">
            {/* <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin Console</p> */}
            <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">
              Welcome back admin
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage products, orders, customers and content.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@eimah.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full h-12 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 rounded-lg border border-border bg-background px-3 pr-11 text-sm focus:outline-none focus:border-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-brand-pink text-ink font-display font-semibold inline-flex items-center justify-center gap-2 hover:bg-ink hover:text-white transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Signing you in…
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} EIMAH · Admin</p>
      </div>

      {/* Right: brand panel */}
      <div className="hidden lg:block relative overflow-hidden bg-ink">
        <div className="absolute inset-0 opacity-70">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/40 to-transparent" />
      </div>
    </div>
  );
}
