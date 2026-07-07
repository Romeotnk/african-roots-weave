import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/commandes")({
  head: () => ({ meta: [{ title: "Commandes - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Commandes",
        eyebrow: "Boutique",
        description: "Retrouvez vos achats, vos ventes et leur progression logistique ou paiement.",
        endpoint: "/orders/mine",
        icon: Package,
        emptyLabel: "Aucune commande pour le moment",
      }}
    />
  ),
});
