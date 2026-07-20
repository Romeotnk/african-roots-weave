import { createFileRoute } from "@tanstack/react-router";
import { RouteRedirect } from "@/components/RouteRedirect";

export const Route = createFileRoute("/dashboard/pro")({
  head: () => ({ meta: [{ title: "Profil professionnel - IWOSAN" }] }),
  component: () => <RouteRedirect to="/tableau-de-bord/profil-pro" label="Ouverture du profil professionnel..." />,
});
