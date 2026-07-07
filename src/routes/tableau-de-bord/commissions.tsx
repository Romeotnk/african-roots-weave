import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/commissions")({
  head: () => ({ meta: [{ title: "Commissions - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Commissions",
        eyebrow: "Reseau",
        description: "Suivez les commissions directes, MLM et affiliation generees par votre activite.",
        endpoint: "/mlm/earnings",
        icon: Wallet,
        emptyLabel: "Aucune commission enregistree",
      }}
    />
  ),
});
