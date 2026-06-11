import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/connexion")({
  head: () => ({ meta: [{ title: "Connexion — IWOSAN" }] }),
  component: Connexion,
});

function Connexion() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("invalid")) setError("Email ou mot de passe incorrect.");
      else if (msg.includes("confirm")) setError("Veuillez confirmer votre email avant de vous connecter.");
      else setError(authError.message);
      return;
    }
    navigate({ to: "/tableau-de-bord" });
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
            Connectez-vous à votre espace Iwosan
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
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" aria-label={show ? "Masquer" : "Afficher"}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-right">
              <Link to="/mot-de-passe-oublie" className="text-[13px] font-semibold text-[var(--brand-primary)] hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
            )}
            <button disabled={isSubmitting} className="w-full h-12 rounded-full bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-dark)] disabled:opacity-70 transition">
              {isSubmitting ? "Connexion…" : "Se connecter"}
            </button>
          </form>
          <p className="mt-6 text-center text-[14px] text-[var(--color-text-muted)]">
            Pas encore inscrit ?{" "}
            <Link to="/inscription" className="font-semibold text-[var(--brand-primary)]">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
