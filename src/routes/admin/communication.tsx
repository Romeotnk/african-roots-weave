import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/communication")({
  head: () => ({ meta: [{ title: "Admin communication - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="communication" />,
});
