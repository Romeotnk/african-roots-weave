import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/logs")({
  head: () => ({ meta: [{ title: "Admin logs - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="logs" />,
});
