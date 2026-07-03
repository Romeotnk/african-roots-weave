import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/finances/litiges")({
  head: () => ({ meta: [{ title: "Admin litiges - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="disputes" />,
});
