import { createFileRoute } from "@tanstack/react-router";
import { AdminGenericPage } from "@/components/admin/AdminGenericPage";

export const Route = createFileRoute("/admin/utilisateurs/kyc")({
  head: () => ({ meta: [{ title: "Admin KYC - IWOSAN" }] }),
  component: () => <AdminGenericPage kind="kyc" />,
});
