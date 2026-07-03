import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/communaute/avis")({
  head: () => ({ meta: [{ title: "Admin avis - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="reviews" />,
});
