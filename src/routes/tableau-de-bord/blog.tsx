import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/blog")({
  head: () => ({ meta: [{ title: "Mon blog - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Mon blog",
        eyebrow: "Profil",
        description: "Retrouvez vos articles, brouillons et publications en attente de validation.",
        endpoint: "/articles/mine",
        icon: FileText,
        emptyLabel: "Aucun article cree",
      }}
    />
  ),
});
