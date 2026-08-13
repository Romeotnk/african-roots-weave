import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AdminHubPage } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/communaute/")({
  head: () => ({ meta: [{ title: "Admin communaute - IWOSAN" }] }),
  component: CommunauteHub,
});

function CommunauteHub() {
  const { t } = useTranslation();
  return (
    <AdminHubPage
      title={t("admin.hubs.communityTitle")}
      description={t("admin.hubs.communityDesc")}
      links={[
        { to: "/admin/communaute/signalements", label: t("admin.hubs.reports"), description: t("admin.hubs.reportsDesc") },
        { to: "/admin/communaute/forum", label: t("admin.hubs.forum"), description: t("admin.hubs.forumDesc") },
        { to: "/admin/communaute/avis", label: t("admin.hubs.reviews"), description: t("admin.hubs.reviewsDesc") },
      ]}
    />
  );
}
