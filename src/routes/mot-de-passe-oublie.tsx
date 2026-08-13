import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { forgotPassword } from "@/lib/api/auth";

export const Route = createFileRoute("/mot-de-passe-oublie")({
  head: () => ({ meta: [{ title: "Mot de passe oublié - IWOSAN" }] }),
  component: Forgot,
});

function Forgot() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : t("forgotPassword.sendError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--brand-bg)]">
      <div className="w-full max-w-[420px] bg-[var(--color-surface)] rounded-[24px] shadow-iwosan-xl p-8 md:p-10">
        <Link to="/" className="block text-center mb-6">
          <span className="font-extrabold text-[24px] text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <h1 className="text-[24px] font-bold text-center">{t("forgotPassword.title")}</h1>
        <p className="text-center text-[14px] text-[var(--color-text-muted)] mt-2">
          {t("forgotPassword.instructions")}
        </p>
        {sent ? (
          <div className="mt-6 text-center">
            <Mail className="mx-auto text-[var(--brand-primary)]" size={48} />
            <p className="mt-3 text-[14px]">
              {t("forgotPassword.emailSentTo", { email })}
            </p>
            <Link to="/connexion" className="mt-6 inline-block text-[var(--brand-primary)] font-semibold">
              {t("forgotPassword.backToLogin")}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder={t("forgotPassword.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)] bg-[var(--color-surface)]"
            />
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
            <button disabled={loading} className="w-full h-12 rounded-full bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-dark)] disabled:opacity-70 transition">
              {loading ? t("forgotPassword.sending") : t("forgotPassword.sendLink")}
            </button>
            <Link to="/connexion" className="block text-center text-[13px] text-[var(--brand-primary)] font-semibold hover:underline">
              {t("forgotPassword.backToLogin")}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
