import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical "Sante au quotidien" list lives at /sante-au-quotidien — this
// route only exists to preserve any previously indexed/bookmarked links.
export const Route = createFileRoute("/sante-quotidien/")({
  beforeLoad: () => {
    throw redirect({ to: "/sante-au-quotidien" });
  },
});
