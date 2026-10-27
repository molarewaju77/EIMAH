import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import { Mail, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact EIMAH — Talk to our team" },
      {
        name: "description",
        content:
          "Reach EIMAH about orders, procurement, sourcing, importation and partnerships. We reply within one business day.",
      },
      { property: "og:title", content: "Contact EIMAH — Talk to our team" },
      {
        property: "og:description",
        content: "Reach EIMAH about orders, procurement, sourcing, and partnerships.",
      },
    ],
  }),
});

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name (minimum 2 characters)")
    .regex(/^[a-zA-Z\s'-]+$/, "Name should only contain letters"),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .min(11, "Phone number must be at least 11 digits")
    .max(20)
    .regex(/^\+?\d{11,15}$/, "Phone number must contain at least 11 digits"),
  subject: z.string().trim().min(1, "Please select a subject"),
  message: z
    .string()
    .trim()
    .min(10, "Please enter at least 10 characters")
    .max(1000, "Message cannot exceed 1000 characters"),
});

const SUBJECTS = [
  "Order enquiry",
  "Business procurement",
  "Product sourcing",
  "Importation",
  "Press & partnerships",
  "Something else",
];

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    let filteredValue = value;
    if (field === "name") {
      // Allow only letters, spaces, hyphens and apostrophes
      filteredValue = value.replace(/[^a-zA-Z\s'-]/g, "");
    } else if (field === "phone") {
      // Allow numbers only (and optional leading '+')
      filteredValue = value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    }

    setForm((prev) => ({ ...prev, [field]: filteredValue }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const iss of parsed.error.issues) {
        const fieldName = String(iss.path[0]);
        if (!errs[fieldName]) {
          errs[fieldName] = iss.message;
        }
      }
      setErrors(errs);
      toast.error("Please correct the errors in the form before submitting.");

      // Scroll smoothly to first invalid field
      const firstKey = Object.keys(errs)[0];
      const el = document.getElementById(`contact-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          subject: parsed.data.subject,
          message: parsed.data.message,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to send message via Edge Function.");
      }

      toast.success("Message sent! We'll reply within one business day.");
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to send message. Please try again or chat with us on WhatsApp.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-surface py-10 md:py-16 mb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-pink/10 via-transparent to-transparent" />

        <div className="container-eimah relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          <h1
            className="font-display font-bold text-5xl md:text-7xl tracking-tight text-balance leading-[1.05] fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Let's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-lime">
              get in touch
            </span>
            .
          </h1>
          <p
            className="mt-6 text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl fade-up"
            style={{ animationDelay: "200ms" }}
          >
            Orders, procurement, sourcing, importation, partnerships — reach the right team here. We
            reply within one business day.
          </p>

          <div
            className="w-16 h-1 bg-gradient-to-r from-brand-pink to-brand-lime mt-10 rounded-full fade-up"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </section>

      <section className="container-eimah pb-24 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-4 space-y-6">
          <InfoCard
            icon={Mail}
            label="Email us"
            value="hello@eimah.com"
            href="mailto:hello@eimah.com"
            note="Best for detailed enquiries."
            color="text-brand-pink"
            bg="bg-brand-pink/10"
          />
          <InfoCard
            icon={Phone}
            label="Call us"
            value="+234(0) 901 835 7843"
            href="tel:+2349018357843"
            note="Mon–Sat · 9:00–18:00 WAT"
            color="text-emerald-600"
            bg="bg-brand-mint/20"
          />
          <InfoCard
            icon={MessageCircle}
            label="WhatsApp"
            value="+234(0) 907 146 4295"
            href="https://wa.me/2349071464295"
            note="Fastest for order updates."
            color="text-lime-600"
            bg="bg-brand-lime/20"
          />
        </aside>

        <div className="lg:col-span-8">
          <form
            onSubmit={onSubmit}
            className="rounded-[2.5rem] bg-gradient-to-br from-brand-pink/5 via-surface to-brand-lime/5 border border-brand-pink/20 p-8 md:p-12 shadow-2xl shadow-brand-pink/10 relative overflow-hidden"
            noValidate
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight">
              Send us a message
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">All fields required.</p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Full name <span className="text-destructive">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Full Name"
                  className={`mt-2 w-full h-14 rounded-xl border bg-background px-4 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                      : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                  }`}
                />
                {errors.name && <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Email address <span className="text-destructive">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="Email Address"
                  className={`mt-2 w-full h-14 rounded-xl border bg-background px-4 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                      : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                  }`}
                />
                {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Phone number <span className="text-destructive">*</span>
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="Phone Number (Min 11 Digits)"
                  className={`mt-2 w-full h-14 rounded-xl border bg-background px-4 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                      : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                  }`}
                />
                {errors.phone && <p className="mt-1.5 text-xs text-destructive">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Subject <span className="text-destructive">*</span>
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  value={form.subject}
                  onChange={(e) => handleFieldChange("subject", e.target.value)}
                  className={`mt-2 w-full h-14 rounded-xl border bg-background px-4 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.subject
                      ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                      : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                  }`}
                >
                  <option value="" disabled>
                    Select A Subject
                  </option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.subject}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <span className="text-xs text-muted-foreground">{form.message.length}/1000</span>
                </div>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  maxLength={1000}
                  value={form.message}
                  onChange={(e) => handleFieldChange("message", e.target.value)}
                  placeholder="Write Your Message Here..."
                  className={`mt-2 w-full rounded-xl border bg-background px-4 py-4 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                    errors.message
                      ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                      : "border-border focus:ring-brand-pink/20 focus:border-brand-pink"
                  }`}
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.message}</p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-pink to-brand-lime text-ink font-display font-semibold px-8 py-4 rounded-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 w-full sm:w-auto"
              >
                {loading ? "Sending…" : "Send message"} <ArrowRight className="size-5" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  note,
  href,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note?: string;
  href?: string;
  color?: string;
  bg?: string;
}) {
  const inner = (
    <div className="flex gap-4 relative z-10 items-center">
      <div
        className={`shrink-0 grid place-items-center h-12 w-12 rounded-xl ${bg || "bg-background"}`}
      >
        <Icon className={`size-5 ${color || "text-foreground"}`} />
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <p className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${color}`}>
          {label}
        </p>
        <p className="mt-0.5 font-display font-bold text-base sm:text-lg truncate">{value}</p>
        {note && <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">{note}</p>}
      </div>
    </div>
  );

  return href ? (
    <a
      href={href}
      className="block rounded-2xl bg-surface border border-border p-5 hover:border-brand-pink/30 hover:shadow-xl hover:shadow-brand-pink/5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${bg}`}
      />
      {inner}
    </a>
  ) : (
    <div className="rounded-2xl bg-surface border border-border p-5 relative overflow-hidden">
      {inner}
    </div>
  );
}

function SocialBtn({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="grid place-items-center h-10 w-10 rounded-full border border-border hover:bg-brand-pink hover:border-brand-pink transition-colors"
    >
      {children}
    </a>
  );
}
