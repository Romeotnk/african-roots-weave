import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { unsubscribeNewsletter } from "@/lib/api/newsletter";

export const Route = createFileRoute("/newsletter/desabonnement/$token")({
  head: () => ({ meta: [{ title: "Désabonnement newsletter - IWOSAN" }] }),
  component: NewsletterUnsubscribe,
});

function NewsletterUnsubscribe() {
  const { t } = useTranslation();
  const { token } = Route.useParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    unsubscribeNewsletter(token)
      .then(() => setStatus("done"))
      .catch((apiError) => {
        setStatus("error");
        setError(apiError instanceof Error ? apiError.message : t("newsletterUnsubscribe.invalidOrUsedLink"));
      });
  }, [token, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)] px-4 py-12">
      <div className="w-full max-w-[420px] rounded-[24px] bg-[var(--color-surface)] p-8 text-center shadow-iwosan-xl md:p-10">
        <Link to="/" className="mb-6 block text-center">
          <span className="text-[24px] font-extrabold text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <h1 className="text-[24px] font-bold">{t("newsletterUnsubscribe.title")}</h1>
        {status === "loading" && (
          <p className="mt-6 text-[14px] text-[var(--color-text-muted)]">{t("newsletterUnsubscribe.processing")}</p>
        )}
        {status === "done" && (
          <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
            {t("newsletterUnsubscribe.success")}
          </p>
        )}
        {status === "error" && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {error}
          </p>
        )}
        <Link to="/" className="mt-6 inline-block text-[14px] font-semibold text-[var(--brand-primary)] hover:underline">
          {t("newsletterUnsubscribe.backToHome")}
        </Link>
      </div>
    </div>
  );
}
