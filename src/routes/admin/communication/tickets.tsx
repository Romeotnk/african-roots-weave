import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/communication/tickets")({
  head: () => ({ meta: [{ title: "Admin tickets - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="tickets" />,
});
