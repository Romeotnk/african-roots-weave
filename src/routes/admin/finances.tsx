import { createFileRoute } from "@tanstack/react-router";
import { AdminHubPage } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/finances")({
  head: () => ({ meta: [{ title: "Admin finances - IWOSAN" }] }),
  component: () => (
    <AdminHubPage
      title="Finances"
      description="Commissions, transactions, remboursements et litiges."
      links={[
        { to: "/admin/finances/commissions", label: "Commissions", description: "Taux global et par niveau MLM." },
        { to: "/admin/finances/transactions", label: "Transactions", description: "Historique des transactions wallet." },
        { to: "/admin/finances/remboursements", label: "Remboursements", description: "Demandes en attente et historique." },
        { to: "/admin/finances/litiges", label: "Litiges", description: "Commandes en litige et résolution." },
        { to: "/admin/finances/abonnements", label: "Abonnements", description: "Forfaits professionnels : plan, quotas et statut." },
      ]}
    />
  ),
});
