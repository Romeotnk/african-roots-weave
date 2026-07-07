import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/mes-produits")({
  head: () => ({ meta: [{ title: "Mes produits - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Mes produits",
        eyebrow: "Boutique",
        description: "Suivez vos produits, leur statut de publication, leur prix et leur stock.",
        endpoint: "/products/mine",
        icon: ShoppingBag,
        action: { label: "Ajouter un produit", to: "/marketplace/deposer" },
        emptyLabel: "Aucun produit publie pour le moment",
      }}
    />
  ),
});
