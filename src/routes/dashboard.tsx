import { createFileRoute } from "@tanstack/react-router";
import { RouteRedirect } from "@/components/RouteRedirect";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord - IWOSAN" }] }),
  component: () => <RouteRedirect to="/tableau-de-bord" label="Ouverture du tableau de bord..." />,
});