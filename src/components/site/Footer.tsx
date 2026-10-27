import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/eimah-logo-white.svg";
import { ArrowRight, Instagram, Mail } from "lucide-react";

const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="size-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="size-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-ink text-white mt-24">
      <div className="container-eimah py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-2 md:col-span-5">
            <img src={logoUrl} className="h-8 w-auto object-contain" alt="EIMAH" />
            <p className="mt-6 max-w-sm text-sm text-white/60 leading-relaxed">
              EIMAH brings quality products closer to consumers and businesses through curated
              retail and dedicated procurement solutions.
            </p>
            {/* <form className="mt-8 max-w-md">
              <label className="text-xs uppercase tracking-widest text-white/50">Newsletter</label>
              <div className="mt-2 flex items-center border-b border-white/20 focus-within:border-white transition-colors">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent py-3 text-sm placeholder:text-white/40 focus:outline-none"
                />
                <button
                  type="button"
                  className="p-2 -mr-2 text-white/80 hover:text-brand-pink transition-colors"
                  aria-label="Subscribe"
                > 
                  <ArrowRight className="size-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-white/40">Early access to drops, seasonal edits, and business insights.</p>
            </form> */}
            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href="https://www.instagram.com/eimah_official?igsi=MWpwbThqdGd4MWJmNQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-pink hover:text-ink transition-colors"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://www.tiktok.com/@eimah_official?_r=1&_t=ZS-99AoU7Nqh41"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tiktok"
                className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-pink hover:text-ink transition-colors"
              >
                <TiktokIcon />
              </a>
              <a
                href="https://wa.me/2349071464295"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-pink hover:text-ink transition-colors"
              >
                <WhatsAppIcon />
              </a>
              <a
                href="mailto:hello@eimah.com"
                aria-label="Email"
                className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-pink hover:text-ink transition-colors"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { l: "All products", h: "/shop" },
              { l: "Clothing", h: "/shop/clothing" },
              { l: "Shoes", h: "/shop/shoes" },
              { l: "Bags", h: "/shop/bags" },
              { l: "Gifts & Sets", h: "/shop/gifts-sets" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { l: "About", h: "/about" },
              { l: "Solutions", h: "/solutions" },
              { l: "Track order", h: "/track" },
              { l: "Contact", h: "/contact" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { l: "Company Policy", h: "/company-policy" },
              { l: "Terms & Conditions", h: "/terms" },
              { l: "Privacy Policy", h: "/privacy" },
              { l: "Delivery Policy", h: "/delivery-policy" },
              { l: "Returns & Exchanges", h: "/refund-policy" },
            ]}
          />
        </div>
      </div>

      {/* Oversized wordmark */}
      <div className="overflow-hidden">
        <div className="container-eimah pb-6">
          <div className="text-[22vw] leading-[0.85] font-display font-black tracking-[-0.06em] bg-gradient-to-b from-white/15 to-white/0 bg-clip-text text-transparent select-none">
            EIMAH<span className="text-brand-pink">.</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-eimah py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} EIMAH. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-white/50">
            <Link to="/company-policy" className="hover:text-white transition-colors">
              Company Policy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link to="/delivery-policy" className="hover:text-white transition-colors">
              Delivery
            </Link>
            <span>·</span>
            <Link to="/refund-policy" className="hover:text-white transition-colors">
              Returns & Exchange
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
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
      className="grid place-items-center h-9 w-9 rounded-full border border-white/15 text-white/80 hover:bg-brand-pink hover:text-ink hover:border-brand-pink transition-colors"
    >
      {children}
    </a>
  );
}

function FooterCol({ title, links }: { title: string; links: { l: string; h: string }[] }) {
  return (
    <div className="md:col-span-2">
      <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.h}>
            <Link to={l.h} className="text-white/85 hover:text-brand-pink transition-colors">
              {l.l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
