import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical recipes list lives at /recettes-sante — this route only exists
// to preserve any previously indexed/bookmarked /recettes links.
export const Route = createFileRoute("/recettes/")({
  beforeLoad: () => {
    throw redirect({ to: "/recettes-sante" });
  },
});
