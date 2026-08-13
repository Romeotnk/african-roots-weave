import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function RouteRedirect({ to, label }: { to: string; label?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const resolvedLabel = label ?? t("routeRedirect.default");

  useEffect(() => {
    void navigate({ to: to as never, replace: true });
  }, [navigate, to]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand-bg)]">
      <div className="text-[var(--color-text-muted)]">{resolvedLabel}</div>
    </div>
  );
}
