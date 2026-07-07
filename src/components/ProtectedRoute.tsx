import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/lib/auth/AuthContext";

export function ProtectedRoute({
  children,
  requireRole,
  requireAnyRole,
}: {
  children: ReactNode;
  requireRole?: AppRole;
  requireAnyRole?: AppRole[];
}) {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const allowedRoles = requireAnyRole ?? (requireRole ? [requireRole] : undefined);
  const hasAllowedRole = !allowedRoles || allowedRoles.some((role) => roles.includes(role));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/connexion" });
    } else if (!hasAllowedRole) {
      navigate({ to: "/" });
    }
  }, [user, loading, hasAllowedRole, navigate]);

  if (loading || !user || !hasAllowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-bg)]">
        <div className="text-[var(--color-text-muted)]">Chargement…</div>
      </div>
    );
  }
  return <>{children}</>;
}
