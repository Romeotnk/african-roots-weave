import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/formations/$id")({
  component: () => <Outlet />,
});
