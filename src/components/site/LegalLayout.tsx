import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { type ReactNode } from "react";

const LEGAL_LINKS = [
  { path: "/company-policy", label: "Company Policy" },
  { path: "/terms", label: "Terms & Conditions" },
  { path: "/privacy", label: "Privacy Policy" },
  { path: "/delivery-policy", label: "Delivery Policy" },
  { path: "/refund-policy", label: "Returns & Exchange" },
];

export function LegalLayout({
  title,
  subtitle,
  lastUpdated = "September 2026",
  currentPath,
  children,
}: {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  currentPath: string;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <div className="bg-white text-neutral-900 min-h-screen">
        {/* Simple black/white top bar */}
        <header className="border-b border-neutral-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black font-sans">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
                {subtitle}
              </p>
            )}
          </div>
        </header>

        {/* Quick horizontal nav between legal documents */}
        <nav className="border-b border-neutral-200 bg-neutral-50 sticky top-0 z-20 overflow-x-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center space-x-1 sm:space-x-2 py-2">
            {LEGAL_LINKS.map((link) => {
              const active = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs whitespace-nowrap px-3 py-1.5 rounded font-medium transition-colors ${
                    active
                      ? "bg-black text-white font-semibold"
                      : "text-neutral-600 hover:text-black hover:bg-neutral-200/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-black prose-p:text-neutral-700 prose-p:leading-relaxed prose-li:text-neutral-700 prose-strong:text-black prose-a:text-black prose-a:underline">
            {children}
          </div>
        </main>
      </div>
    </SiteLayout>
  );
}
