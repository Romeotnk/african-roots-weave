import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/site/accueil")({
  head: () => ({ meta: [{ title: "Admin accueil - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="home" />,
});
