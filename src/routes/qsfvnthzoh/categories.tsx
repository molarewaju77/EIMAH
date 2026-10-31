import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit3, Trash2, X, Upload, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { SectionCard } from "@/components/admin/parts";
import { type AdminCategory } from "@/lib/admin-store";
import { Loader } from "@/components/ui/loader";
import { uploadImageToSupabase } from "@/lib/storage";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/hooks/queries/useCategoriesQuery";

export const Route = createFileRoute("/qsfvnthzoh/categories")({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: "Categories — EIMAH Admin" }, { name: "robots", content: "noindex" }] }),
});

function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const [edit, setEdit] = useState<AdminCategory | null>(null);
  const [show, setShow] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading categories..." />
      </div>
    );
  }

  const handleSave = async (c: AdminCategory) => {
    if (!c.name || !c.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    const slug = c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (edit) {
      await updateMutation.mutateAsync({ slug: edit.slug, patch: { ...c, slug } });
    } else {
      await createMutation.mutateAsync({ ...c, slug });
    }
    setShow(false);
  };

  const handleToggle = async (c: AdminCategory, active: boolean) => {
    await updateMutation.mutateAsync({ slug: c.slug, patch: { active } });
  };

  const handleToggleFeatured = async (c: AdminCategory, featured: boolean) => {
    await updateMutation.mutateAsync({ slug: c.slug, patch: { featured } });
  };

  const handleDelete = async (slug: string) => {
    setDeletingSlug(slug);
    try {
      await deleteMutation.mutateAsync(slug);
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">
          Categories
        </h2>
        <button
          onClick={() => { setEdit(null); setShow(true); }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-brand-pink text-ink font-semibold text-sm hover:bg-ink hover:text-white transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="size-4" /> Add Category
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <SectionCard key={c.slug}>
            <div className="aspect-[16/9] rounded-lg overflow-hidden bg-surface-2 mb-4 relative group">
              {c.image ? (
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center bg-surface text-muted-foreground text-xs">
                  No image uploaded
                </div>
              )}
              {c.featured && (
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-ink/80 backdrop-blur-md text-amber-300 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border border-white/10 shadow-sm">
                  <Sparkles className="size-3 text-amber-400 fill-amber-400" />
                  Featured
                </div>
              )}
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-semibold text-lg">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.productCount || 0} products</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={c.active}
                    onChange={(e) => handleToggle(c, e.target.checked)}
                    className="accent-[#F590DD]"
                  />
                  <span>{c.active ? "Enabled" : "Disabled"}</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(c.featured)}
                    onChange={(e) => handleToggleFeatured(c, e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span className="text-muted-foreground text-[11px]">Featured</span>
                </label>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{c.blurb}</p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => { setEdit(c); setShow(true); }}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-xs font-semibold hover:bg-secondary cursor-pointer"
              >
                <Edit3 className="size-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(c.slug)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-border text-xs font-semibold text-destructive hover:bg-red-50 cursor-pointer disabled:opacity-50 min-w-[76px]"
              >
                {deletingSlug === c.slug ? (
                  <>
                    <Loader size="xs" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </SectionCard>
        ))}
      </div>

      {show && (
        <CatForm
          initial={edit}
          isPending={createMutation.isPending || updateMutation.isPending}
          onClose={() => setShow(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function CatForm({
  initial,
  isPending,
  onClose,
  onSave,
}: {
  initial: AdminCategory | null;
  isPending: boolean;
  onClose: () => void;
  onSave: (c: AdminCategory) => void;
}) {
  const [f, setF] = useState<AdminCategory>(
    initial ?? {
      slug: "",
      name: "",
      image: "",
      blurb: "",
      active: true,
      featured: false,
      productCount: 0,
    }
  );

  const [useUrl, setUseUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const toastId = toast.loading("Uploading category image to Supabase...");
    try {
      const publicUrl = await uploadImageToSupabase(file, "categories");
      setF((prev) => ({ ...prev, image: publicUrl }));
      toast.success("Category image uploaded successfully", { id: toastId });
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
            {initial ? "Edit Category" : "Add Category"}
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
            <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
              Category Name <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              required
              value={f.name}
              onChange={(e) =>
                setF({
                  ...f,
                  name: e.target.value,
                  slug: f.slug || e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
              placeholder="e.g. Traditional Wear"
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
              Slug <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              required
              value={f.slug}
              onChange={(e) => setF({ ...f, slug: e.target.value })}
              placeholder="traditional-wear"
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none"
            />
          </div>

          {/* Category Image Dropzone & Preview (Fixed Height) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1">
                Category Image <span className="text-rose-500 font-bold">*</span>
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
                <img src={f.image} alt="Category preview" className="w-full h-full object-cover" />
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
                    {isUploading ? "Uploading to Supabase..." : "Click to upload category image *"}
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
            <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
              Blurb / Description <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              required
              value={f.blurb}
              onChange={(e) => setF({ ...f, blurb: e.target.value })}
              placeholder="Short category summary..."
              className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={f.active}
                onChange={(e) => setF({ ...f, active: e.target.checked })}
                className="accent-[#F590DD]"
              />
              <span className="font-medium text-xs">Enable Category</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(f.featured)}
                onChange={(e) => setF({ ...f, featured: e.target.checked })}
                className="accent-amber-500"
              />
              <span className="font-medium text-xs flex items-center gap-1.5 text-foreground">
                <Sparkles className="size-3.5 text-amber-500 fill-amber-500" />
                Feature on Homepage
              </span>
            </label>
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
              if (!f.name || !f.name.trim()) {
                toast.error("Category name is required");
                return;
              }
              if (!f.slug || !f.slug.trim()) {
                toast.error("Category slug is required");
                return;
              }
              if (!f.image || !f.image.trim()) {
                toast.error("Category image is required");
                return;
              }
              if (!f.blurb || !f.blurb.trim()) {
                toast.error("Category description is required");
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
              <span>Save Category</span>
            )}
          </button>
        </footer>

      </div>
    </div>
  );
}
