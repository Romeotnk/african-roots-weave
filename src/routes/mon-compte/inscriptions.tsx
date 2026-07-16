import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { USER_ACCOUNT_ROLES } from "@/lib/auth/roles";
import { Registrations } from "@/routes/dashboard/inscriptions";

export const Route = createFileRoute("/mon-compte/inscriptions")({
  head: () => ({ meta: [{ title: "Mes inscriptions - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={USER_ACCOUNT_ROLES}>
      <Registrations />
    </ProtectedRoute>
  ),
});
