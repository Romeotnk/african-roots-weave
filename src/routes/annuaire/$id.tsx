import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical profile page lives at /pro/$id — this route only exists to
// preserve any previously indexed/bookmarked /annuaire/:id links.
export const Route = createFileRoute("/annuaire/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/pro/$id", params: { id: params.id } });
  },
});
