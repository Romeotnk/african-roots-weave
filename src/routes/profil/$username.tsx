import { createFileRoute, redirect } from "@tanstack/react-router";

// This route's data fetching used the username param as if it were a
// User.id (both to load the professional and to load reviews scoped by
// profileId), which real usernames never match — it always fell back to
// mock data. It's also unreferenced anywhere else in the app. The canonical,
// fully wired profile page is /pro/$id — redirect there instead of
// maintaining a second, broken implementation.
export const Route = createFileRoute("/profil/$username")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/pro/$id", params: { id: params.username } });
  },
});
