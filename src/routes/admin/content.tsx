import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Edit3, Trash2, X, Eye, ArrowRight, Upload, Bell } from "lucide-react";
import { toast } from "react-toastify";
import { AdminPageHeader } from "@/components/admin/AdminLayout";
import { SectionCard, StatusPill } from "@/components/admin/parts";
import { useAdminStore, type Banner, type Popup, type Solution } from "@/lib/admin-store";
import { Loader } from "@/components/ui/loader";
import { uploadImageToSupabase } from "@/lib/storage";
import {
  useBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  usePopupsQuery,
  useCreatePopupMutation,
  useUpdatePopupMutation,
  useDeletePopupMutation,
  useSolutionsQuery,
  useUpdateSolutionMutation,
} from "@/hooks/queries/useContentQuery";
import { useCategoriesQuery } from "@/hooks/queries/useCategoriesQuery";
import { formatNaira } from "@/lib/mock-data";
import { getPopupTargetUrl, getBannerTargetUrl, adminCategories } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/content")({
  component: ContentPage,
  head: () => ({
    meta: [{ title: "Content Management — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const TABS = ["Promotional Banners", "Popup Announcements", "Business & Learning Solutions"];

function ContentPage() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <div>
      <AdminPageHeader
        crumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Content Management" }]}
      />
      <div className="mb-6 border-b border-border overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 h-11 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${tab === t ? "border-brand-pink text-ink" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Promotional Banners" && <BannersTab />}
      {tab === "Popup Announcements" && <PopupsTab />}
      {tab === "Business & Learning Solutions" && <SolutionsTab />}
    </div>
  );
}

function BannersTab() {
  const { data: banners = [], isLoading } = useBannersQuery();
  const createMutation = useCreateBannerMutation();
  const updateMutation = useUpdateBannerMutation();
  const deleteMutation = useDeleteBannerMutation();
  const [edit, setEdit] = useState<Banner | null>(null);
  const [show, setShow] = useState(false);
  const [preview, setPreview] = useState<Banner | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading promotional banners..." />
      </div>
    );
  }

  const handleSaveBanner = async (b: Banner) => {
    if (edit) {
      await updateMutation.mutateAsync({ id: edit.id, patch: b });
    } else {
      const bannerId = `BNR-${Math.floor(100 + Math.random() * 900)}`;
      await createMutation.mutateAsync({ ...b, id: bannerId });
    }
    setShow(false);
  };

  const handleDeleteBanner = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h3 className="font-display font-bold text-lg text-foreground">Promotional Banners</h3>
        <button
          onClick={() => {
            setEdit(null);
            setShow(true);
          }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-brand-pink text-ink text-xs sm:text-sm font-semibold hover:bg-ink hover:text-white transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="size-4" /> Upload Banner
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {banners.map((b) => (
          <div
            key={b.id}
            className="rounded-3xl border border-border bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Mini Banner Preview Box Matching Customer Storefront Banner */}
              <div className="relative rounded-2xl bg-ink text-white p-4 sm:p-5 overflow-hidden space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#F590DD] truncate">
                    {b.eyebrow || "SEASONAL DROP"}
                  </span>
                  <StatusPill value={b.status} />
                </div>
                <div className="text-[10px] text-white/60 font-mono truncate">
                  Target: {getBannerTargetUrl(b.ctaTarget, b.ctaUrl)}
                </div>

                <div className="grid grid-cols-5 gap-3 items-center">
                  <div className="col-span-3 space-y-1.5">
                    <h4 className="font-display font-bold text-sm text-white line-clamp-2 leading-snug">
                      {b.title}
                    </h4>
                    <p className="text-[11px] text-white/70 line-clamp-2">{b.supportingText}</p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 bg-[#F590DD] text-ink font-semibold text-[10px] px-2.5 py-1 rounded-full">
                        {b.ctaText || "Shop now"} <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shrink-0 bg-white/5">
                    {b.image ? (
                      <img src={b.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-[10px] text-white/40">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => setPreview(b)}
                className="flex-1 h-9 rounded-xl border border-border text-xs font-semibold hover:bg-secondary inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="size-3.5" /> Preview
              </button>
              <button
                onClick={() => {
                  setEdit(b);
                  setShow(true);
                }}
                className="flex-1 h-9 rounded-xl border border-border text-xs font-semibold hover:bg-secondary inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="size-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDeleteBanner(b.id)}
                disabled={deleteMutation.isPending}
                className="h-9 px-3 rounded-xl border border-border text-xs font-semibold text-destructive hover:bg-red-50 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-w-[36px]"
                title="Delete Banner"
              >
                {deletingId === b.id ? <Loader size="xs" /> : <Trash2 className="size-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Upload / Edit Modal Form */}
      {show && (
        <BannerForm
          initial={edit}
          isPending={createMutation.isPending || updateMutation.isPending}
          onClose={() => setShow(false)}
          onSave={handleSaveBanner}
        />
      )}

      {/* Storefront Customer-Facing Banner Live Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <button
            onClick={() => setPreview(null)}
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in"
          />
          <div className="relative w-full max-w-4xl bg-ink text-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10 my-auto">
            <button
              onClick={() => setPreview(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close preview"
            >
              <X className="size-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest font-bold text-[#F590DD]">
                  {preview.eyebrow || "SEASONAL DROP"}
                </p>
                <h3 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white leading-tight">
                  {preview.title}
                </h3>
                <p className="text-sm text-white/80 leading-relaxed max-w-md">
                  {preview.supportingText}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 bg-[#F590DD] text-ink font-display font-semibold text-sm px-6 py-3 rounded-full hover:bg-white transition-colors cursor-pointer shadow-sm">
                    {preview.ctaText || "Shop the edit"} <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>

              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5">
                <img
                  src={preview.image}
                  alt={preview.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BannerForm({
  initial,
  isPending,
  onClose,
  onSave,
}: {
  initial: Banner | null;
  isPending: boolean;
  onClose: () => void;
  onSave: (b: Banner) => void;
}) {
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesQuery();
  const availableCategories = useMemo(() => {
    const list = categories.length > 0 ? categories : adminCategories;
    return list.filter((c) => c.active !== false);
  }, [categories]);

  const [f, setF] = useState<Banner>(
    initial ?? {
      id: "",
      eyebrow: "SEASONAL DROP",
      title: "",
      supportingText: "",
      ctaText: "Shop the edit",
      ctaTarget: "shop",
      ctaUrl: "/shop",
      image: "",
      status: "Draft",
      startDate: "",
      endDate: "",
    },
  );

  const [useUrl, setUseUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const normalizedSelectedTarget = useMemo(() => {
    if (!f.ctaTarget) return "shop";
    if (f.ctaTarget.startsWith("category:")) return f.ctaTarget;
    const matching = availableCategories.find(
      (c) => c.slug === f.ctaTarget || (f.ctaTarget === "gifts" && c.slug === "gifts-sets"),
    );
    if (matching) return `category:${matching.slug}`;
    return f.ctaTarget;
  }, [f.ctaTarget, availableCategories]);

  const handleTargetChange = (target: string) => {
    let url = f.ctaUrl;
    if (target.startsWith("category:")) {
      const slug = target.slice("category:".length);
      url = `/shop?category=${encodeURIComponent(slug)}`;
    } else if (target === "home") url = "/";
    else if (target === "shop") url = "/shop";
    else if (target === "clothing") url = "/shop?category=clothing";
    else if (target === "shoes") url = "/shop?category=shoes";
    else if (target === "bags") url = "/shop?category=bags";
    else if (target === "gifts") url = "/shop?category=gifts-sets";
    else if (target === "solutions") url = "/solutions";
    else if (target === "solutions-business") url = "/solutions/business";
    else if (target === "sourcing") url = "/solutions/business/sourcing";
    else if (target === "procurement") url = "/solutions/business/procurement";
    else if (target === "importation") url = "/solutions/business/importation";
    else if (target === "academy") url = "/solutions/academy";
    else if (target === "academy-procurement") url = "/solutions/academy/procurement";
    else if (target === "academy-importation") url = "/solutions/academy/importation";
    else if (target === "about") url = "/about";
    else if (target === "track") url = "/track";
    else if (target === "contact") url = "/contact";
    else if (target === "custom" && (!url || url.startsWith("/"))) {
      url = "";
    }
    setF({ ...f, ctaTarget: target, ctaUrl: url });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const toastId = toast.loading("Uploading banner image to Supabase...");
    try {
      const publicUrl = await uploadImageToSupabase(file, "banners");
      setF((prev) => ({ ...prev, image: publicUrl }));
      toast.success("Banner image uploaded successfully", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image", { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setF((prev) => ({ ...prev, image: "" }));
    toast.info("Image removed");
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-2 sm:p-6 overflow-y-auto">
      <button
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in"
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col my-auto max-h-[85dvh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Fixed Header */}
        <header className="h-14 sm:h-16 px-5 sm:px-6 border-b border-border flex items-center justify-between shrink-0 bg-white sticky top-0 z-20">
          <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
            {initial ? "Edit Promotional Banner" : "Upload Promotional Banner"}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-secondary/80 hover:bg-secondary border border-border/50 text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer shadow-2xs"
            aria-label="Close modal"
          >
            <X className="size-4 stroke-[2.5]" />
          </button>
        </header>

        {/* Scrollable Middle Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1">
              Eyebrow Tag / Subheading <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              required
              value={f.eyebrow || ""}
              onChange={(e) => setF({ ...f, eyebrow: e.target.value })}
              placeholder="e.g. SEASONAL DROP, LIMITED TIME"
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1">
              Banner Headline / Title <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              required
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              placeholder="e.g. The Essentials Edit — up to 30% off."
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1">
              Supporting Text <span className="text-rose-500 font-bold">*</span>
            </label>
            <textarea
              required
              value={f.supportingText}
              onChange={(e) => setF({ ...f, supportingText: e.target.value })}
              rows={2}
              placeholder="A tightly edited selection of everyday pieces..."
              className="w-full rounded-xl border border-border p-3 text-sm focus:border-foreground outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1">
              CTA Button Text <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              required
              value={f.ctaText}
              onChange={(e) => setF({ ...f, ctaText: e.target.value })}
              placeholder="e.g. Shop the edit"
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground block">
                CTA Destination Target
              </label>
              {categoriesLoading && (
                <span className="text-[10px] text-muted-foreground">Loading categories...</span>
              )}
            </div>
            <select
              value={normalizedSelectedTarget}
              onChange={(e) => handleTargetChange(e.target.value)}
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none cursor-pointer"
            >
              <optgroup label="Main Header & Shop Pages">
                <option value="shop">Shop Page (/shop)</option>
                <option value="home">Home Page (/)</option>
                <option value="about">About Us (/about)</option>
                <option value="track">Track Order (/track)</option>
                <option value="contact">Contact Us (/contact)</option>
              </optgroup>

              <optgroup label="Shop Categories">
                {availableCategories.map((c) => (
                  <option key={c.slug} value={`category:${c.slug}`}>
                    {c.name} Category (/shop?category={c.slug})
                  </option>
                ))}
              </optgroup>

              <optgroup label="Business Advisory Solutions">
                <option value="solutions">Solutions Hub (/solutions)</option>
                <option value="solutions-business">
                  Business Solutions Overview (/solutions/business)
                </option>
                <option value="sourcing">
                  Product Sourcing Service (/solutions/business/sourcing)
                </option>
                <option value="procurement">
                  Business Procurement Service (/solutions/business/procurement)
                </option>
                <option value="importation">
                  Business Importation Service (/solutions/business/importation)
                </option>
              </optgroup>

              <optgroup label="EIMAH Training Academy">
                <option value="academy">Training Academy Overview (/solutions/academy)</option>
                <option value="academy-procurement">
                  Procurement Training (/solutions/academy/procurement)
                </option>
                <option value="academy-importation">
                  China Importation Training (/solutions/academy/importation)
                </option>
              </optgroup>

              <optgroup label="Custom Destination">
                <option value="custom">Custom Link / Particular URL</option>
              </optgroup>
            </select>
          </div>

          {f.ctaTarget === "custom" && (
            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                Custom Target URL <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                required
                value={f.ctaUrl || ""}
                onChange={(e) => setF({ ...f, ctaUrl: e.target.value })}
                placeholder="e.g. /shop?category=clothing or https://..."
                className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none"
              />
            </div>
          )}

          {/* Banner Image Dropzone & Preview (Fixed Height) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1">
                Banner Image <span className="text-rose-500 font-bold">*</span>
              </label>
              <button
                type="button"
                onClick={() => setUseUrl(!useUrl)}
                className="text-[11px] text-brand-pink font-semibold hover:underline cursor-pointer"
              >
                {useUrl ? "Upload File Instead" : "Paste Image URL"}
              </button>
            </div>

            {f.image ? (
              <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-border bg-surface group shrink-0">
                <img src={f.image} alt="Banner preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  title="Remove Image"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-ink/80 text-white hover:bg-black transition-colors shadow-md cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : useUrl ? (
              <input
                required
                value={f.image}
                onChange={(e) => setF({ ...f, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none"
              />
            ) : (
              <label className="border-2 border-dashed border-border rounded-2xl h-32 w-full p-3 text-center flex flex-col items-center justify-center gap-1 hover:border-brand-pink cursor-pointer bg-surface/40 hover:bg-brand-pink/5 transition-all shrink-0">
                <Upload className="size-5 text-brand-pink" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {isUploading ? "Uploading to Supabase..." : "Click to upload banner image *"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground block mb-1">
              Status
            </label>
            <select
              value={f.status}
              onChange={(e) => setF({ ...f, status: e.target.value as Banner["status"] })}
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Draft">Draft</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Fixed Footer */}
        <footer className="p-4 sm:p-5 border-t border-border flex items-center justify-end gap-2.5 shrink-0 bg-white sticky bottom-0 z-20">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!f.eyebrow || !f.eyebrow.trim()) {
                toast.error("Eyebrow tag is required");
                return;
              }
              if (!f.title || !f.title.trim()) {
                toast.error("Banner headline / title is required");
                return;
              }
              if (!f.supportingText || !f.supportingText.trim()) {
                toast.error("Supporting text is required");
                return;
              }
              if (!f.ctaText || !f.ctaText.trim()) {
                toast.error("CTA button text is required");
                return;
              }
              if (!f.image || !f.image.trim()) {
                toast.error("Banner image is required");
                return;
              }
              onSave(f);
            }}
            className="h-10 px-5 rounded-xl bg-brand-pink text-ink text-xs font-semibold hover:bg-ink hover:text-white transition-colors shadow-sm cursor-pointer disabled:opacity-75 inline-flex items-center justify-center gap-2 min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader size="xs" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Banner</span>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}

function PopupsTab() {
  const { data: popups = [], isLoading } = usePopupsQuery();
  const createMutation = useCreatePopupMutation();
  const updateMutation = useUpdatePopupMutation();
  const deleteMutation = useDeletePopupMutation();
  const [edit, setEdit] = useState<Popup | null>(null);
  const [show, setShow] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading popup announcements..." />
      </div>
    );
  }

  const handleSavePopup = async (p: Popup) => {
    if (edit) {
      await updateMutation.mutateAsync({ id: edit.id, patch: p });
    } else {
      const popupId = `POP-${Math.floor(100 + Math.random() * 900)}`;
      await createMutation.mutateAsync({ ...p, id: popupId });
    }
    setShow(false);
  };

  const handleDeletePopup = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePopup = async (id: string, active: boolean) => {
    await updateMutation.mutateAsync({ id, patch: { status: active ? "Active" : "Disabled" } });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEdit(null);
            setShow(true);
          }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-brand-pink text-ink text-sm font-semibold hover:bg-ink hover:text-white transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="size-4" /> Create Popup
        </button>
      </div>
      {popups.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-surface/40">
          <Bell className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-foreground">No announcement popups yet</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click "Create Popup" above to announce sales, promotions, or store updates.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {popups.map((p) => (
            <SectionCard key={p.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-medium text-foreground">CTA: "{p.ctaText}"</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground font-mono text-[11px]">
                      Target: {getPopupTargetUrl(p.ctaTarget, p.ctaUrl)}
                    </span>
                  </div>
                </div>
                <StatusPill value={p.status} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.status === "Active"}
                    onChange={(e) => handleTogglePopup(p.id, e.target.checked)}
                    className="accent-[#F590DD]"
                  />{" "}
                  Visible
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEdit(p);
                      setShow(true);
                    }}
                    className="h-9 px-3 rounded-md border border-border text-xs font-semibold hover:bg-secondary cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePopup(p.id)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-border text-xs font-semibold text-destructive hover:bg-red-50 cursor-pointer disabled:opacity-50 min-w-[76px]"
                  >
                    {deletingId === p.id ? (
                      <>
                        <Loader size="xs" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Delete</span>
                    )}
                  </button>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <button
            onClick={() => setShow(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-xs cursor-pointer"
          />
          <PopupForm
            initial={edit}
            isPending={createMutation.isPending || updateMutation.isPending}
            onClose={() => setShow(false)}
            onSave={handleSavePopup}
          />
        </div>
      )}
    </>
  );
}

function PopupForm({
  initial,
  isPending,
  onClose,
  onSave,
}: {
  initial: Popup | null;
  isPending: boolean;
  onClose: () => void;
  onSave: (p: Popup) => void;
}) {
  const [f, setF] = useState<Popup>(
    initial ?? {
      id: "",
      title: "",
      body: "",
      ctaText: "Explore Solutions",
      ctaTarget: "solutions",
      ctaUrl: "/solutions",
      status: "Draft",
    },
  );

  const handleTargetChange = (target: Popup["ctaTarget"]) => {
    let url = f.ctaUrl;
    if (target === "home") url = "/";
    else if (target === "shop") url = "/shop";
    else if (target === "solutions") url = "/solutions";
    else if (target === "solutions-business") url = "/solutions/business";
    else if (target === "sourcing") url = "/solutions/business/sourcing";
    else if (target === "procurement") url = "/solutions/business/procurement";
    else if (target === "importation") url = "/solutions/business/importation";
    else if (target === "academy") url = "/solutions/academy";
    else if (target === "academy-procurement") url = "/solutions/academy/procurement";
    else if (target === "academy-importation") url = "/solutions/academy/importation";
    else if (target === "track") url = "/track";
    else if (target === "contact") url = "/contact";
    else if (target === "custom" && (!url || url.startsWith("/"))) {
      url = "";
    }
    setF({ ...f, ctaTarget: target, ctaUrl: url });
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-display font-bold text-lg">
          {initial ? "Edit Popup" : "Create Popup"}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-secondary text-muted-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1">
            Title <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            required
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
            className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1">
            Body <span className="text-rose-500 font-bold">*</span>
          </label>
          <textarea
            required
            value={f.body}
            onChange={(e) => setF({ ...f, body: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-border p-3 text-sm focus:border-foreground outline-none resize-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1">
            CTA Button Text <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            required
            value={f.ctaText}
            onChange={(e) => setF({ ...f, ctaText: e.target.value })}
            placeholder="e.g. Explore Solutions"
            className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground block mb-1">
            CTA Destination Target
          </label>
          <select
            value={f.ctaTarget || "solutions"}
            onChange={(e) => handleTargetChange(e.target.value as Popup["ctaTarget"])}
            className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none cursor-pointer"
          >
            <optgroup label="Main Header Pages">
              <option value="home">Home Page (/)</option>
              <option value="shop">Shop Page (/shop)</option>
              <option value="solutions">Solutions Hub (/solutions)</option>
              <option value="track">Track Order (/track)</option>
              <option value="contact">Contact Us (/contact)</option>
            </optgroup>

            <optgroup label="Business Advisory Solutions">
              <option value="solutions-business">
                Business Solutions Overview (/solutions/business)
              </option>
              <option value="sourcing">
                Product Sourcing Service (/solutions/business/sourcing)
              </option>
              <option value="procurement">
                Business Procurement Service (/solutions/business/procurement)
              </option>
              <option value="importation">
                Business Importation Service (/solutions/business/importation)
              </option>
            </optgroup>

            <optgroup label="EIMAH Training Academy">
              <option value="academy">Training Academy Overview (/solutions/academy)</option>
              <option value="academy-procurement">
                Procurement Training (/solutions/academy/procurement)
              </option>
              <option value="academy-importation">
                China Importation Training (/solutions/academy/importation)
              </option>
            </optgroup>

            <optgroup label="Custom Destination">
              <option value="custom">Custom Link / Particular URL</option>
            </optgroup>
          </select>
        </div>

        {f.ctaTarget === "custom" && (
          <div className="animate-in fade-in duration-200">
            <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1">
              Custom Link / URL <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              required
              value={f.ctaUrl || ""}
              onChange={(e) => setF({ ...f, ctaUrl: e.target.value })}
              placeholder="e.g. /solutions/business/sourcing or https://..."
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Enter internal route (e.g.{" "}
              <code className="bg-surface px-1 py-0.5 rounded">/solutions/business/sourcing</code>)
              or full external URL (
              <code className="bg-surface px-1 py-0.5 rounded">https://...</code>).
            </p>
          </div>
        )}

        <div>
          <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground block mb-1">
            Status
          </label>
          <select
            value={f.status}
            onChange={(e) => setF({ ...f, status: e.target.value as Popup["status"] })}
            className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none cursor-pointer"
          >
            <option value="Active">Active</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Draft">Draft</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>
      <div className="pt-2 flex justify-end gap-2 border-t border-border">
        <button
          type="button"
          disabled={isPending}
          onClick={onClose}
          className="h-10 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!f.title || !f.title.trim()) {
              toast.error("Popup title is required");
              return;
            }
            if (!f.body || !f.body.trim()) {
              toast.error("Popup body is required");
              return;
            }
            if (!f.ctaText || !f.ctaText.trim()) {
              toast.error("CTA text is required");
              return;
            }
            onSave(f);
          }}
          className="h-10 px-5 rounded-xl bg-brand-pink text-ink text-xs font-semibold hover:bg-ink hover:text-white transition-colors shadow-sm cursor-pointer disabled:opacity-75 inline-flex items-center justify-center gap-2 min-w-[100px]"
        >
          {isPending ? (
            <>
              <Loader size="xs" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Popup</span>
          )}
        </button>
      </div>
    </div>
  );
}

function SolutionsTab() {
  const { data: solutions = [], isLoading } = useSolutionsQuery();
  const updateMutation = useUpdateSolutionMutation();
  const [editSolution, setEditSolution] = useState<Solution | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [discountPercentInput, setDiscountPercentInput] = useState("");

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading business & learning solutions..." />
      </div>
    );
  }

  const handleOpenEdit = (s: Solution) => {
    setEditSolution(s);
    setPriceInput(String(s.price || ""));
    setDiscountPercentInput(s.discountPercent ? String(s.discountPercent) : "");
  };

  const currentPriceNum = parseFloat(priceInput) || 0;
  const currentDiscountPct = parseFloat(discountPercentInput) || 0;
  const calculatedFee =
    currentDiscountPct > 0 && currentDiscountPct < 100
      ? Math.round(currentPriceNum * (1 - currentDiscountPct / 100))
      : currentPriceNum;

  const handleSavePrice = async () => {
    if (!editSolution) return;
    if (isNaN(currentPriceNum) || currentPriceNum <= 0) {
      toast.error("Please enter a valid regular price");
      return;
    }

    if (discountPercentInput.trim() !== "") {
      if (isNaN(currentDiscountPct) || currentDiscountPct < 1 || currentDiscountPct > 100) {
        toast.error("Discount percentage must be between 1% and 100%");
        return;
      }
    }

    const hasDisc = currentDiscountPct >= 1 && currentDiscountPct <= 100;
    const calcDiscPrice = hasDisc
      ? Math.round(currentPriceNum * (1 - currentDiscountPct / 100))
      : undefined;

    await updateMutation.mutateAsync({
      id: editSolution.id,
      patch: {
        price: currentPriceNum,
        discountPercent: hasDisc ? currentDiscountPct : undefined,
        discountPrice: calcDiscPrice,
      },
    });

    setEditSolution(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-lg text-foreground">
          Business & Learning Solutions
        </h3>
        <p className="text-xs text-muted-foreground">
          Manage service packages and pricing for business advisory & academy training.
        </p>
      </div>

      {solutions.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl border border-dashed border-border bg-white flex flex-col items-center justify-center space-y-2">
          <h4 className="font-display font-bold text-base text-foreground">
            No Solutions Found
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            No business or learning solution packages found in the database.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {solutions.map((s) => {
            const hasDiscount = Boolean(s.discountPercent && s.discountPercent > 0);

            return (
              <div
                key={s.id}
                className="rounded-3xl border border-border bg-white p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-ink text-white shadow-xs">
                      {s.category}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-pink text-ink shadow-xs">
                        {s.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-base text-foreground mb-1">
                      {s.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Service Fee:
                    </span>
                    {hasDiscount ? (
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-bold text-base text-foreground">
                          {formatNaira(s.discountPrice || s.price)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through font-medium">
                          {formatNaira(s.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-base text-foreground">
                        {formatNaira(s.price)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="h-8.5 px-3.5 rounded-xl text-xs font-semibold bg-brand-pink/20 text-ink border border-brand-pink/40 hover:bg-brand-pink transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Edit3 className="size-3.5 text-ink" /> Edit Price
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Solution Price Modal */}
      {editSolution && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs cursor-pointer animate-in fade-in"
            onClick={() => {
              if (!updateMutation.isPending) setEditSolution(null);
            }}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-border z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Edit Solution Price
                </h3>
                <p className="text-xs text-muted-foreground">{editSolution.title}</p>
              </div>
              <button
                disabled={updateMutation.isPending}
                onClick={() => setEditSolution(null)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                  Regular Price (₦) *
                </label>
                <input
                  type="number"
                  disabled={updateMutation.isPending}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="e.g. 35000"
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none font-semibold disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                  Discount Percentage (%){" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  disabled={updateMutation.isPending}
                  value={discountPercentInput}
                  onChange={(e) => setDiscountPercentInput(e.target.value)}
                  placeholder="1 - 100 (e.g. 10 for 10% off)"
                  min="1"
                  max="100"
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none font-semibold disabled:opacity-60"
                />
              </div>

              {/* Calculated Price Live Preview */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border/70 space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold block uppercase tracking-wider">
                  Calculated Customer Fee:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-foreground">
                    {formatNaira(calculatedFee)}
                  </span>
                  {currentDiscountPct > 0 && (
                    <span className="text-xs font-bold text-ink bg-brand-pink px-2 py-0.5 rounded-full">
                      {currentDiscountPct}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => setEditSolution(null)}
                className="h-10 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={handleSavePrice}
                className="h-10 px-5 rounded-xl bg-brand-pink text-ink text-xs font-semibold hover:bg-ink hover:text-white transition-colors shadow-sm cursor-pointer disabled:opacity-75 inline-flex items-center justify-center gap-2 min-w-[120px]"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader size="xs" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Pricing</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
