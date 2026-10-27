import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";

const POLICY_REDIRECT_MAP: Record<string, { title: string; subtitle: string; path: string }> = {
  privacy: {
    title: "Privacy Policy",
    subtitle: "How EIMAH collects, uses, stores, and protects your personal data.",
    path: "/privacy",
  },
  terms: {
    title: "Terms & Conditions",
    subtitle: "The legal terms governing your use of Eimah's website and purchase of products.",
    path: "/terms",
  },
  delivery: {
    title: "Delivery Policy",
    subtitle: "How we process, ship, and fulfil orders placed through the Eimah platform.",
    path: "/delivery-policy",
  },
  refund: {
    title: "Returns & Exchange Policy",
    subtitle: "The conditions and guidelines under which returns or exchanges may be requested.",
    path: "/refund-policy",
  },
  company: {
    title: "Company Policy",
    subtitle: "The operational standards, service commitments, and principles that guide Eimah Ltd.",
    path: "/company-policy",
  },
};

export const Route = createFileRoute("/policies/$slug")({
  component: PolicyFallbackPage,
  loader: ({ params }) => {
    const p = POLICY_REDIRECT_MAP[params.slug];
    if (!p) throw notFound();
    return { ...p, slug: params.slug };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — EIMAH Legal` },
          { name: "description", content: loaderData.subtitle },
        ]
      : [],
  }),
});

function PolicyFallbackPage() {
  const data = Route.useLoaderData();

  return (
    <LegalLayout
      title={data.title}
      subtitle={data.subtitle}
      currentPath={data.path}
      lastUpdated="September 2026"
    >
      <div className="border border-neutral-200 p-8 rounded bg-neutral-50 text-center space-y-4">
        <h2 className="text-xl font-bold text-black">Dedicated Document Available</h2>
        <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
          This document is published on its own dedicated official page.
        </p>
        <div>
          <Link
            to={data.path}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-black text-white text-xs font-mono uppercase tracking-wider rounded hover:bg-neutral-800 transition-colors"
          >
            View Official {data.title}
          </Link>
        </div>
      </div>
    </LegalLayout>
  );
}
