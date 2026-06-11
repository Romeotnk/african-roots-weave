import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Leaf, FlaskConical, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES } from "@/lib/auth/countries";

export const Route = createFileRoute("/inscription")({
  head: () => ({ meta: [{ title: "Inscription — IWOSAN" }] }),
  component: Inscription,
});

const roles = [
  { id: "user", label: "Utilisateur", desc: "Découvrir, acheter, échanger", Icon: User },
  { id: "professional", label: "Professionnel", desc: "Publier, vendre, consulter", Icon: Leaf },
  { id: "researcher", label: "Chercheur", desc: "Documenter, publier, étudier", Icon: FlaskConical },
];

function Inscription() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("user");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Bénin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!acceptedTerms) {
      setError("Vous devez accepter les CGU et la politique de confidentialité.");
      return;
    }

    setIsSubmitting(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/tableau-de-bord`,
        data: {
          first_name: firstName,
          last_name: lastName,
          country,
          role,
        },
      },
    });
    setIsSubmitting(false);

    if (authError) {
      if (authError.message.toLowerCase().includes("already")) {
        setError("Un compte existe déjà avec cet email. Connectez-vous.");
      } else {
        setError(authError.message);
      }
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--brand-bg)]">
        <div className="w-full max-w-[480px] bg-[var(--color-surface)] rounded-[24px] shadow-iwosan-xl p-8 md:p-10 text-center">
          <CheckCircle2 className="mx-auto mb-4 text-[var(--brand-primary)]" size={56} />
          <h1 className="text-[24px] font-bold">Vérifiez votre boîte mail</h1>
          <p className="mt-3 text-[14px] text-[var(--color-text-muted)]">
            Un lien de confirmation a été envoyé à <strong>{email}</strong>. Cliquez dessus pour activer votre compte, puis connectez-vous.
          </p>
          <button
            onClick={() => navigate({ to: "/connexion" })}
            className="mt-6 h-12 px-6 rounded-full bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-dark)] transition"
          >
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--brand-bg)]">
      <div className="w-full max-w-[480px]">
        <Link to="/" className="block text-center mb-8">
          <span className="font-extrabold text-[28px] text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <div className="bg-[var(--color-surface)] rounded-[24px] shadow-iwosan-xl p-8 md:p-10">
          <h1 className="text-[28px] text-center font-bold">Créer un compte</h1>
          <p className="text-center text-[14px] text-[var(--color-text-muted)] mt-1">
            Rejoignez la communauté Iwosan
          </p>

          <div className="mt-7">
            <p className="text-[13px] font-semibold mb-3">Je suis…</p>
            <div className="space-y-2">
              {roles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition ${role === item.id ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border)] hover:border-[var(--brand-primary)]"}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === item.id ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)] text-[var(--brand-primary)]"}`}>
                    <item.Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[14px]">{item.label}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)]">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={50} className="h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)] bg-[var(--color-surface)]" />
              <input placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={50} className="h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)] bg-[var(--color-surface)]" />
            </div>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)] bg-[var(--color-surface)]" />
            <select value={country} onChange={(e) => setCountry(e.target.value)} required className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none bg-[var(--color-surface)]">
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="password" placeholder="Mot de passe (8 caractères min)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)] bg-[var(--color-surface)]" />
            <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)] bg-[var(--color-surface)]" />
            <label className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)]">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 accent-[var(--brand-primary)]" />
              J'accepte les CGU et la politique de confidentialité
            </label>
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-full bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-dark)] disabled:opacity-70 transition">
              {isSubmitting ? "Création du compte…" : "S'inscrire"}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-[var(--color-text-muted)]">
            Déjà inscrit ?{" "}
            <Link to="/connexion" className="font-semibold text-[var(--brand-primary)]">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
