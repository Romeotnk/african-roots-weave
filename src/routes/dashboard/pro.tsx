import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { RouteRedirect } from "@/components/RouteRedirect";

export const Route = createFileRoute("/dashboard/pro")({
  head: () => ({ meta: [{ title: "Profil professionnel - IWOSAN" }] }),
  component: DashboardProRedirect,
});

function DashboardProRedirect() {
  const { t } = useTranslation();
  return <RouteRedirect to="/tableau-de-bord/profil-pro" label={t("routeRedirect.openingProProfile")} />;
}
