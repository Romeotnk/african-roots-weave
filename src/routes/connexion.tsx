import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/api/auth";
import { signInWithSocialProvider, type SocialAuthProvider } from "@/lib/auth/social";
import { useAuth } from "@/lib/auth/AuthContext";

export const Route = createFileRoute("/connexion")({
  head: () => ({ meta: [{ title: "Connexion - IWOSAN" }] }),
  component: Connexion,
});

function Connexion() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState<SocialAuthProvider | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/tableau-de-bord" });
    }
  }, [loading, navigate, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate({ to: "/tableau-de-bord" });
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Connexion impossible pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: SocialAuthProvider) => {
    setError(null);
    setIsSocialSubmitting(provider);

    try {
      await signInWithSocialProvider(provider);
    } catch (socialError) {
      setError(socialError instanceof Error ? socialError.message : "La connexion sociale n'a pas pu etre lancee.");
      setIsSocialSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--brand-bg)]">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="block text-center mb-8">
          <span className="font-extrabold text-[28px] text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <div className="bg-[var(--color-surface)] rounded-[24px] shadow-iwosan-xl p-8 md:p-10">
          <h2 className="text-[28px] text-center font-bold">Bon retour !</h2>
          <p className="text-center text-[14px] text-[var(--color-text-muted)] mt-1">
            Connectez-vous a votre espace Iwosan
          </p>
          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)] bg-[var(--color-surface)]"
            />
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 pr-11 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)] bg-[var(--color-surface)]"
              />
              <button
                type="button"
                onClick={() => setShow((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-right">
              <Link to="/mot-de-passe-oublie" className="text-[13px] font-semibold text-[var(--brand-primary)] hover:underline">
                Mot de passe oublie ?
              </Link>
            </div>
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
            )}
            <button disabled={isSubmitting} className="w-full h-12 rounded-full bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-dark)] disabled:opacity-70 transition">
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
            <div className="h-px flex-1 bg-[var(--brand-border-light)]" /> ou continuer avec <div className="h-px flex-1 bg-[var(--brand-border-light)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => handleSocialSignIn("google")} disabled={isSocialSubmitting !== null} className="h-11 rounded-[8px] border border-[var(--brand-border)] text-[14px] font-semibold hover:bg-[var(--brand-surface-alt)] disabled:opacity-70">
              {isSocialSubmitting === "google" ? "Ouverture..." : "Google"}
            </button>
            <button type="button" onClick={() => handleSocialSignIn("facebook")} disabled={isSocialSubmitting !== null} className="h-11 rounded-[8px] bg-[#1877F2] text-[14px] font-semibold text-white disabled:opacity-70">
              {isSocialSubmitting === "facebook" ? "Ouverture..." : "Facebook"}
            </button>
          </div>

          <p className="mt-6 text-center text-[14px] text-[var(--color-text-muted)]">
            Pas encore inscrit ?{" "}
            <Link to="/inscription" className="font-semibold text-[var(--brand-primary)]">Creer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
