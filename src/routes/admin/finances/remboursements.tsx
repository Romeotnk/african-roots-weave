import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/finances/remboursements")({
  head: () => ({ meta: [{ title: "Admin remboursements - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="refunds" />,
});
