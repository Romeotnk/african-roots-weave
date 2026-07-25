import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical forum lives at /forum (its sub-routes /forum/$id and
// /forum/nouvelle-question already depend on this prefix) — this route only
// exists to preserve any previously indexed/bookmarked /discutons-en links.
export const Route = createFileRoute("/discutons-en")({
  beforeLoad: () => {
    throw redirect({ to: "/forum" });
  },
});
