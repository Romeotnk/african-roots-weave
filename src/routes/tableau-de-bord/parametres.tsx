import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/parametres")({
  head: () => ({ meta: [{ title: "Parametres - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Parametres",
        eyebrow: "Compte",
        description: "Controlez les informations et preferences principales de votre compte.",
        endpoint: "/auth/me",
        icon: Settings,
        emptyLabel: "Parametres indisponibles",
      }}
    />
  ),
});
