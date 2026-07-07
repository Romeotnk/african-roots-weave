import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/evenements")({
  head: () => ({ meta: [{ title: "Mes evenements - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Mes evenements",
        eyebrow: "Communaute",
        description: "Evenements, webinaires ou salons que vous avez proposes.",
        endpoint: "/events/mine",
        icon: Calendar,
        emptyLabel: "Aucun evenement cree",
      }}
    />
  ),
});
