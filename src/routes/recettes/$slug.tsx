import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical recipe detail lives at /recettes-sante/$slug — this route only
// exists to preserve any previously indexed/bookmarked /recettes/:slug links.
export const Route = createFileRoute("/recettes/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/recettes-sante/$slug", params: { slug: params.slug } });
  },
});
