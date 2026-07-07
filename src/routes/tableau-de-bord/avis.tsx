import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/avis")({
  head: () => ({ meta: [{ title: "Avis recus - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Avis recus",
        eyebrow: "Profil",
        description: "Suivez les retours clients sur vos produits et votre profil professionnel.",
        endpoint: "/professionals/me/reviews",
        icon: Star,
        emptyLabel: "Aucun avis recu",
      }}
    />
  ),
});
