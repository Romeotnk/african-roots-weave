import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/site/menus")({
  head: () => ({ meta: [{ title: "Admin menus - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="menus" />,
});
