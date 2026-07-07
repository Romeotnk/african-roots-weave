import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/questions")({
  head: () => ({ meta: [{ title: "Mes questions - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Mes questions",
        eyebrow: "Communaute",
        description: "Suivez vos questions publiees dans le forum et leur activite.",
        endpoint: "/forum/questions/mine",
        icon: MessageSquare,
        action: { label: "Poser une question", to: "/forum/nouvelle-question" },
        emptyLabel: "Aucune question posee",
      }}
    />
  ),
});
