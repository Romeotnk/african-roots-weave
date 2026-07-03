import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/communaute/signalements")({
  head: () => ({ meta: [{ title: "Admin signalements - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="reports" />,
});
