import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/utilisateurs")({
  head: () => ({ meta: [{ title: "Admin utilisateurs - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="users" />,
});
