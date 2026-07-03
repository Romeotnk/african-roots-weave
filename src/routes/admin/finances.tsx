import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/finances")({
  head: () => ({ meta: [{ title: "Admin finances - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="finance" />,
});
