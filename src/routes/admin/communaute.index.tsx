import { createFileRoute } from "@tanstack/react-router";
import { AdminHubPage } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/communaute/")({
  head: () => ({ meta: [{ title: "Admin communaute - IWOSAN" }] }),
  component: () => (
    <AdminHubPage
      title="Communauté"
      description="Signalements, forum et avis."
      links={[
        { to: "/admin/communaute/signalements", label: "Signalements", description: "File de modération des contenus signalés." },
        { to: "/admin/communaute/forum", label: "Forum", description: "Questions vedettes et catégories." },
        { to: "/admin/communaute/avis", label: "Avis", description: "Avis publiés, signalés et modération." },
      ]}
    />
  ),
});
