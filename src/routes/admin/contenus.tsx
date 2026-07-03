import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/contenus")({
  head: () => ({ meta: [{ title: "Admin contenus - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="content" />,
});
