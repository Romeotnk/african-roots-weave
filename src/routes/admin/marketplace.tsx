import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/marketplace")({
  head: () => ({ meta: [{ title: "Admin marketplace - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="marketplace" />,
});
