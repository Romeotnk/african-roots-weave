import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/finances/commissions")({
  head: () => ({ meta: [{ title: "Admin commissions - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="commissions" />,
});
