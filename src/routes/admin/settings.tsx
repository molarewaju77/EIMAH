import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-toastify";
import { AdminPageHeader } from "@/components/admin/AdminLayout";
import { SectionCard } from "@/components/admin/parts";
import { useAdminAuth } from "@/lib/admin-store";
import {
  usePickupStationsQuery,
  useCreatePickupStationMutation,
  useUpdatePickupStationMutation,
  useDeletePickupStationMutation,
} from "@/hooks/queries/usePickupStationsQuery";
import { formatNaira } from "@/lib/mock-data";
import { Trash2, Edit2, Plus, X } from "lucide-react";
import { Loader } from "@/components/ui/loader";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [{ title: "Settings — EIMAH Admin" }, { name: "robots", content: "noindex" }],
  }),
});

// const TABS = ["Store", "Delivery", "Pickup Stations", "Policies", "Admin profile"];
const TABS = ["Pickup Stations", "Admin profile"];

function SettingsPage() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <div>
      <AdminPageHeader crumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Settings" }]} />
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
      {/* {tab === "Store" && <StoreTab />} */}
      {/* {tab === "Delivery" && <DeliveryTab />} */}
      {tab === "Pickup Stations" && <PickupStationsTab />}
      {/* {tab === "Policies" && <PoliciesTab />} */}
      {tab === "Admin profile" && <ProfileTab />}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
const inp =
  "w-full h-10 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:border-foreground";

function StoreTab() {
  return (
    <SectionCard title="Store settings">
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
        <Row label="Store name">
          <input defaultValue="EIMAH" className={inp} />
        </Row>
        <Row label="Support email">
          <input defaultValue="hello@eimah.co" className={inp} />
        </Row>
        <Row label="Phone">
          <input defaultValue="+234 800 000 0000" className={inp} />
        </Row>
        <Row label="City">
          <input defaultValue="Lagos, Nigeria" className={inp} />
        </Row>
        <Row label="Logo URL">
          <input defaultValue="/eimah-logo.svg" className={inp} />
        </Row>
      </div>
      <button
        onClick={() => toast.success("Store settings saved")}
        className="mt-6 h-10 px-5 rounded-full bg-brand-pink text-ink font-semibold text-sm"
      >
        Save
      </button>
    </SectionCard>
  );
}
function DeliveryTab() {
  return (
    <SectionCard title="Delivery settings">
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
        <Row label="Standard delivery fee (₦)">
          <input defaultValue="3500" className={inp} />
        </Row>
        <Row label="Free delivery threshold (₦)">
          <input defaultValue="75000" className={inp} />
        </Row>
        <Row label="Lagos ETA">
          <input defaultValue="24 – 48 hours" className={inp} />
        </Row>
        <Row label="Nationwide ETA">
          <input defaultValue="3 – 5 business days" className={inp} />
        </Row>
        <div className="md:col-span-2">
          <Row label="Delivery policy">
            <textarea
              rows={4}
              defaultValue="Nationwide delivery in 3–5 business days. Orders placed before 3pm ship same day."
              className={`${inp} h-auto py-2 resize-none`}
            />
          </Row>
        </div>
      </div>
      <button
        onClick={() => toast.success("Delivery settings saved")}
        className="mt-6 h-10 px-5 rounded-full bg-brand-pink text-ink font-semibold text-sm"
      >
        Save
      </button>
    </SectionCard>
  );
}
function PoliciesTab() {
  const policies = ["Refund Policy", "Delivery Policy", "Terms & Conditions", "Company Policy"];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {policies.map((p) => (
        <SectionCard
          key={p}
          title={p}
          action={
            <button
              onClick={() => toast.success(`${p} saved`)}
              className="h-8 px-3 rounded-full bg-brand-pink text-ink text-xs font-semibold"
            >
              Save
            </button>
          }
        >
          <textarea
            rows={8}
            defaultValue={`Sample ${p} content. Update this to reflect the current EIMAH policy.`}
            className={`${inp} h-auto py-2 resize-none`}
          />
        </SectionCard>
      ))}
    </div>
  );
}
function ProfileTab() {
  const admin = useAdminAuth((s) => s.admin);
  return (
    <SectionCard title="Admin profile">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="grid place-items-center h-16 w-16 rounded-full text-xl font-semibold text-ink"
          style={{ background: admin?.avatarBg }}
        >
          {admin?.name.charAt(0)}
        </div>
        <div>
          <p className="font-display font-semibold">{admin?.name}</p>
          <p className="text-sm text-muted-foreground">{admin?.role}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
        <Row label="Full name">
          <input defaultValue={admin?.name} className={inp} />
        </Row>
        <Row label="Email">
          <input defaultValue={admin?.email} className={inp} />
        </Row>
        <Row label="Role">
          <input defaultValue={admin?.role} className={inp} disabled />
        </Row>
        <Row label="Profile image URL">
          <input placeholder="https://…" className={inp} />
        </Row>
      </div>
      <button
        onClick={() => toast.success("Profile updated")}
        className="mt-6 h-10 px-5 rounded-full bg-brand-pink text-ink font-semibold text-sm"
      >
        Save
      </button>
    </SectionCard>
  );
}

function PickupStationsTab() {
  const { data: pickupStations = [], isLoading, isFetching } = usePickupStationsQuery();
  const createMutation = useCreatePickupStationMutation();
  const updateMutation = useUpdatePickupStationMutation();
  const deleteMutation = useDeletePickupStationMutation();

  const [showModal, setShowModal] = useState(false);
  const [editStation, setEditStation] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", address: "", feeInput: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditStation(null);
    setForm({ name: "", address: "", feeInput: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (ps: any) => {
    setEditStation(ps);
    setForm({
      name: ps.name || "",
      address: ps.address || "",
      feeInput: ps.fee !== undefined && ps.fee !== null ? String(ps.fee) : "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      toast.error("Please fill in both station name and address.");
      return;
    }

    const feeVal = form.feeInput.trim() === "" ? 0 : Math.max(0, Number(form.feeInput) || 0);

    if (editStation) {
      await updateMutation.mutateAsync({
        id: editStation.id,
        patch: { name: form.name.trim(), address: form.address.trim(), fee: feeVal },
      });
    } else {
      await createMutation.mutateAsync({
        id: "PS-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
        name: form.name.trim(),
        address: form.address.trim(),
        fee: feeVal,
      });
    }

    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <SectionCard title="Pickup Stations">
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader size="lg" label="Loading pickup stations..." />
        </div>
      </SectionCard>
    );
  }

  return (
    <>
      <SectionCard
        title="Pickup Stations"
        action={
          <button
            onClick={handleOpenAdd}
            className="h-9 px-3.5 rounded-xl bg-brand-pink text-ink text-xs font-semibold flex items-center gap-1.5 hover:bg-ink hover:text-white transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" /> Add Station
          </button>
        }
      >
        <div className="space-y-3">
          {pickupStations.map((ps) => (
            <div
              key={ps.id}
              className="border border-border/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white shadow-2xs hover:border-brand-pink/40 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-semibold text-foreground text-sm sm:text-base">{ps.name}</h4>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-brand-pink/20 text-ink">
                    {(ps.fee || 0) === 0 ? "Free" : formatNaira(ps.fee!)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ps.address}</p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => handleOpenEdit(ps)}
                  className="h-8 px-3 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Edit2 className="size-3" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(ps.id)}
                  disabled={deleteMutation.isPending}
                  className="h-8 px-3 rounded-lg border border-border text-xs font-semibold text-destructive hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1 min-w-[36px]"
                  title="Delete Station"
                >
                  {deletingId === ps.id ? (
                    <Loader size="xs" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {pickupStations.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
              No pickup stations added yet. Click &quot;Add Station&quot; to create one.
            </div>
          )}
        </div>
      </SectionCard>

      {/* Add / Edit Pickup Station Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs cursor-pointer animate-in fade-in"
            onClick={() => {
              if (!isSaving) setShowModal(false);
            }}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-border z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  {editStation ? "Edit Pickup Station" : "Add Pickup Station"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editStation
                    ? "Update location details and pickup fee"
                    : "Configure a new pickup location for customer orders"}
                </p>
              </div>
              <button
                disabled={isSaving}
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
                  Station Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  disabled={isSaving}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. First Gate Ikorodu, Ikeja Mall Pick-up"
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none font-medium disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
                  Full Address <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  rows={2}
                  disabled={isSaving}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Shop 4, Behind First Bank, Lagos Road, Ikorodu, Lagos"
                  className="w-full rounded-xl border border-border p-3 text-sm focus:border-foreground outline-none font-medium resize-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
                  Pickup / Shipping Fee (₦) <span className="text-muted-foreground font-normal">(Leave empty or 0 for Free)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={isSaving}
                  value={form.feeInput}
                  onChange={(e) => setForm({ ...form, feeInput: e.target.value })}
                  placeholder="e.g. 1500 or 0 for Free"
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:border-foreground outline-none font-semibold disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setShowModal(false)}
                className="h-10 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="h-10 px-5 rounded-xl bg-brand-pink text-ink text-xs font-semibold hover:bg-ink hover:text-white transition-colors shadow-sm cursor-pointer disabled:opacity-75 inline-flex items-center justify-center gap-2 min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader size="xs" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editStation ? "Save Changes" : "Add Station"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
