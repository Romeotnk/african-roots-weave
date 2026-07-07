import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["super_admin", "admin", "moderator", "editor"]}>
      <AdminDashboard />
    </ProtectedRoute>
  ),
});
