import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { isClientAuthed } from "@/lib/admin-store";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: () => {
    if (!isClientAuthed()) {
      throw redirect({
        to: "/admin-login",
      });
    }
  },
  component: AdminShell,
  head: () => ({
    meta: [
      { title: "Admin Console — EIMAH" },
      { name: "description", content: "EIMAH administration console." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminShell() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

