import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/lib/auth/AuthContext";

export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: AppRole;
}) {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/connexion" });
    } else if (requireRole && !roles.includes(requireRole)) {
      navigate({ to: "/" });
    }
  }, [user, loading, roles, requireRole, navigate]);

  if (loading || !user || (requireRole && !roles.includes(requireRole))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-bg)]">
        <div className="text-[var(--color-text-muted)]">Chargement…</div>
      </div>
    );
  }
  return <>{children}</>;
}
