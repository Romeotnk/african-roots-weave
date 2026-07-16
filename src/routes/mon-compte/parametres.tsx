import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { USER_ACCOUNT_ROLES } from "@/lib/auth/roles";
import { SettingsPage } from "@/routes/tableau-de-bord/parametres";

export const Route = createFileRoute("/mon-compte/parametres")({
  head: () => ({ meta: [{ title: "Parametres - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={USER_ACCOUNT_ROLES}>
      <SettingsPage allowedRoles={USER_ACCOUNT_ROLES} />
    </ProtectedRoute>
  ),
});
