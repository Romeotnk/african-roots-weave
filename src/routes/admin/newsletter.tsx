import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/newsletter")({
  head: () => ({ meta: [{ title: "Admin newsletter - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="newsletter" />,
});
