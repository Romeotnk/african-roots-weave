import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical article detail lives at /sante-au-quotidien/$slug — this route
// only exists to preserve any previously indexed/bookmarked links.
export const Route = createFileRoute("/sante-quotidien/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/sante-au-quotidien/$slug", params: { slug: params.slug } });
  },
});
