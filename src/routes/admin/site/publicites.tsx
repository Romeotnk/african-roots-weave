import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/site/publicites")({
  head: () => ({ meta: [{ title: "Admin publicites - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="ads" />,
});
