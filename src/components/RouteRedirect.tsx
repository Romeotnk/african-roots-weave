import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export function RouteRedirect({ to, label = "Redirection..." }: { to: string; label?: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: to as never, replace: true });
  }, [navigate, to]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand-bg)]">
      <div className="text-[var(--color-text-muted)]">{label}</div>
    </div>
  );
}
