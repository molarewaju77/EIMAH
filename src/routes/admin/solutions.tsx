import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/solutions")({
  component: () => <Navigate to="/admin/applications" replace />,
});
