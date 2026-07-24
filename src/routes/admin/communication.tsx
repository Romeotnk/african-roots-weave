import { createFileRoute } from "@tanstack/react-router";
import { AdminHubPage } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/communication")({
  head: () => ({ meta: [{ title: "Admin communication - IWOSAN" }] }),
  component: () => (
    <AdminHubPage
      title="Communication"
      description="Newsletter, notifications et support."
      links={[
        { to: "/admin/communication/newsletter", label: "Newsletter", description: "Abonnés et envoi de campagnes." },
        { to: "/admin/communication/notifications", label: "Notifications push", description: "Envoi ciblé et historique." },
        { to: "/admin/communication/tickets", label: "Tickets support", description: "Liste, statut et réponses." },
      ]}
    />
  ),
});
