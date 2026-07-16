import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { USER_ACCOUNT_ROLES } from "@/lib/auth/roles";
import { ProfilePage } from "@/routes/tableau-de-bord/profil";

export const Route = createFileRoute("/mon-compte/profil")({
  head: () => ({ meta: [{ title: "Mon profil - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={USER_ACCOUNT_ROLES}>
      <ProfilePage allowedRoles={USER_ACCOUNT_ROLES} />
    </ProtectedRoute>
  ),
});
