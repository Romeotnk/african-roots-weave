import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/finances/transactions")({
  head: () => ({ meta: [{ title: "Admin transactions - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="transactions" />,
});
