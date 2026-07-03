import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/communication/notifications")({
  head: () => ({ meta: [{ title: "Admin notifications - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="notifications" />,
});
