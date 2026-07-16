import { createFileRoute } from "@tanstack/react-router";
import { RouteRedirect } from "@/components/RouteRedirect";

export const Route = createFileRoute("/dashboard/annonces")({
  head: () => ({ meta: [{ title: "Annonces professionnelles - IWOSAN" }] }),
  component: () => <RouteRedirect to="/tableau-de-bord/mes-produits" label="Ouverture de vos annonces..." />,
});