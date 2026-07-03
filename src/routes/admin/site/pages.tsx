import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/site/pages")({
  head: () => ({ meta: [{ title: "Admin pages - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="pages" />,
});
