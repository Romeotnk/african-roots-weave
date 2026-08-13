import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { RouteRedirect } from "@/components/RouteRedirect";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Tableau de bord - IWOSAN" }] }),
  component: DashboardIndexRedirect,
});

function DashboardIndexRedirect() {
  const { t } = useTranslation();
  return <RouteRedirect to="/tableau-de-bord" label={t("routeRedirect.openingDashboard")} />;
}