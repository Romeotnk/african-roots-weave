import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/recettes-sante")({
  component: () => <Outlet />,
});
