import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/communaute")({
  head: () => ({ meta: [{ title: "Admin communaute - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="community" />,
});
