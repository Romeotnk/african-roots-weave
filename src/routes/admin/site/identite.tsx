import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/site/identite")({
  head: () => ({ meta: [{ title: "Admin identite - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="identity" />,
});
