import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AdminHubPage } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/finances/")({
  head: () => ({ meta: [{ title: "Admin finances - IWOSAN" }] }),
  component: FinancesHub,
});

function FinancesHub() {
  const { t } = useTranslation();
  return (
    <AdminHubPage
      title={t("admin.hubs.financesTitle")}
      description={t("admin.hubs.financesDesc")}
      links={[
        { to: "/admin/finances/commissions", label: t("admin.hubs.commissions"), description: t("admin.hubs.commissionsDesc") },
        { to: "/admin/finances/transactions", label: t("admin.hubs.transactions"), description: t("admin.hubs.transactionsDesc") },
        { to: "/admin/finances/remboursements", label: t("admin.hubs.refunds"), description: t("admin.hubs.refundsDesc") },
        { to: "/admin/finances/litiges", label: t("admin.hubs.disputes"), description: t("admin.hubs.disputesDesc") },
        { to: "/admin/finances/abonnements", label: t("admin.hubs.subscriptions"), description: t("admin.hubs.subscriptionsDesc") },
      ]}
    />
  );
}
