import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { resetPassword } from "@/lib/api/auth";

export const Route = createFileRoute("/reset-password/$token")({
  head: () => ({ meta: [{ title: "Nouveau mot de passe — IWOSAN" }] }),
  component: ResetPasswordWithToken,
});

function ResetPasswordWithToken() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Au moins 8 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      window.setTimeout(() => navigate({ to: "/connexion" }), 1800);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Lien invalide ou expire.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)] px-4 py-12">
      <div className="w-full max-w-[420px] rounded-[24px] bg-[var(--color-surface)] p-8 shadow-iwosan-xl md:p-10">
        <Link to="/" className="mb-6 block text-center">
          <span className="text-[24px] font-extrabold text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <h1 className="text-center text-[24px] font-bold">Nouveau mot de passe</h1>
        {done ? (
          <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-[13px] text-emerald-700">
            Mot de passe mis a jour. Redirection...
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="h-12 w-full rounded-lg border border-[var(--brand-border)] bg-[var(--color-surface)] px-4 outline-none focus:border-[var(--brand-primary)]"
            />
            <input
              type="password"
              placeholder="Confirmer"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
              className="h-12 w-full rounded-lg border border-[var(--brand-border)] bg-[var(--color-surface)] px-4 outline-none focus:border-[var(--brand-primary)]"
            />
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="h-12 w-full rounded-full bg-[var(--brand-primary)] font-semibold text-white transition hover:bg-[var(--brand-primary-dark)] disabled:opacity-70"
            >
              {loading ? "Mise a jour..." : "Mettre a jour"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
