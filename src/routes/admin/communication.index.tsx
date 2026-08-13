import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AdminHubPage } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/communication/")({
  head: () => ({ meta: [{ title: "Admin communication - IWOSAN" }] }),
  component: CommunicationHub,
});

function CommunicationHub() {
  const { t } = useTranslation();
  return (
    <AdminHubPage
      title={t("admin.hubs.communicationTitle")}
      description={t("admin.hubs.communicationDesc")}
      links={[
        { to: "/admin/communication/newsletter", label: t("admin.hubs.newsletter"), description: t("admin.hubs.newsletterDesc") },
        { to: "/admin/communication/notifications", label: t("admin.hubs.pushNotifications"), description: t("admin.hubs.pushNotificationsDesc") },
        { to: "/admin/communication/tickets", label: t("admin.hubs.supportTickets"), description: t("admin.hubs.supportTicketsDesc") },
      ]}
    />
  );
}
