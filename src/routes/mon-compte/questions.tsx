import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { USER_ACCOUNT_ROLES } from "@/lib/auth/roles";
import { QuestionsPage } from "@/routes/tableau-de-bord/questions";

export const Route = createFileRoute("/mon-compte/questions")({
  head: () => ({ meta: [{ title: "Mes questions - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={USER_ACCOUNT_ROLES}>
      <QuestionsPage allowedRoles={USER_ACCOUNT_ROLES} />
    </ProtectedRoute>
  ),
});
