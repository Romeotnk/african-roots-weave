import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical page is /admin/communication/newsletter — this route only exists
// to preserve any previously bookmarked/linked /admin/newsletter path.
export const Route = createFileRoute("/admin/newsletter")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/communication/newsletter" });
  },
});
