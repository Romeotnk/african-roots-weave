import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/communaute/forum")({
  head: () => ({ meta: [{ title: "Admin forum - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="forum" />,
});
