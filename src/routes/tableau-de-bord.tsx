import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tableau-de-bord")({
  component: () => <Outlet />,
});
