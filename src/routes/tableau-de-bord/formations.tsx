import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/formations")({
  head: () => ({ meta: [{ title: "Mes formations - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Mes formations",
        eyebrow: "Communaute",
        description: "Liste des ressources de formation que vous avez creees ou publiees.",
        endpoint: "/formations/mine",
        icon: GraduationCap,
        emptyLabel: "Aucune formation creee",
      }}
    />
  ),
});
