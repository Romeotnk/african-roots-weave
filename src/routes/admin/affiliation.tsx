import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/affiliation")({
  head: () => ({ meta: [{ title: "Admin affiliation - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="affiliate" />,
});
