import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/reset-password/")({
  head: () => ({ meta: [{ title: "Nouveau mot de passe - IWOSAN" }] }),
  component: ResetPasswordInfo,
});

function ResetPasswordInfo() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)] px-4 py-12">
      <div className="w-full max-w-[420px] rounded-[24px] bg-[var(--color-surface)] p-8 text-center shadow-iwosan-xl md:p-10">
        <Link to="/" className="mb-6 block">
          <span className="text-[24px] font-extrabold text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <h1 className="text-[24px] font-bold">{t("resetPasswordInfo.title")}</h1>
        <p className="mt-3 text-[14px] leading-6 text-[var(--color-text-muted)]">
          {t("resetPasswordInfo.desc")}
        </p>
        <Link
          to="/mot-de-passe-oublie"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 text-[14px] font-semibold text-white hover:bg-[var(--brand-primary-dark)]"
        >
          {t("resetPasswordInfo.requestLink")}
        </Link>
      </div>
    </div>
  );
}
