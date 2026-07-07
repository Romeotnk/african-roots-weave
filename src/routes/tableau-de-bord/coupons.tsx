import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { ClientSectionPage } from "@/components/dashboard/ClientSectionPage";

export const Route = createFileRoute("/tableau-de-bord/coupons")({
  head: () => ({ meta: [{ title: "Coupons - IWOSAN" }] }),
  component: () => (
    <ClientSectionPage
      config={{
        title: "Coupons",
        eyebrow: "Boutique",
        description: "Gerez les codes promotionnels rattaches a votre boutique.",
        endpoint: "/coupons",
        icon: Tag,
        emptyLabel: "Aucun coupon cree",
      }}
    />
  ),
});
