import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/reseau")({
  head: () => ({ meta: [{ title: "Mon reseau - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Mon reseau",
        eyebrow: "Reseau",
        description: "Visualisez votre arbre MLM et les membres rattaches a votre code.",
        endpoint: "/mlm/my-tree",
        icon: Users,
        emptyLabel: "Aucun membre dans votre reseau",
      }}
    />
  ),
});
