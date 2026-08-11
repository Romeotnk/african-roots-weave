import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/mes-commandes")({
  component: () => <Outlet />,
});
