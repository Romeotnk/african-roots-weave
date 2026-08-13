import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { RouteRedirect } from "@/components/RouteRedirect";

export const Route = createFileRoute("/dashboard/annonces")({
  head: () => ({ meta: [{ title: "Annonces professionnelles - IWOSAN" }] }),
  component: DashboardAnnoncesRedirect,
});

function DashboardAnnoncesRedirect() {
  const { t } = useTranslation();
  return <RouteRedirect to="/tableau-de-bord/mes-produits" label={t("routeRedirect.openingListings")} />;
}