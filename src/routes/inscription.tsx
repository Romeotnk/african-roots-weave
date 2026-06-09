import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { User, Leaf, FlaskConical } from "lucide-react";
import { register } from "@/lib/api/auth";

export const Route = createFileRoute("/inscription")({
  head: () => ({ meta: [{ title: "Inscription - IWOSAN" }] }),
  component: Inscription,
});

const roles = [
  { id: "user", label: "Utilisateur", desc: "Decouvrir, acheter, echanger", Icon: User },
  { id: "pro", label: "Professionnel", desc: "Publier, vendre, consulter", Icon: Leaf },
  {
    id: "researcher",
    label: "Chercheur",
    desc: "Documenter, publier, etudier",
    Icon: FlaskConical,
  },
];

function Inscription() {
  const [role, setRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Senegal");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!acceptedTerms) {
      setError("Vous devez accepter les CGU et la politique de confidentialite.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        country,
        language: "fr",
      });
      setMessage("Compte cree. Verifiez votre email pour activer votre compte.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Inscription impossible pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--brand-bg)]">
      <div className="w-full max-w-[480px]">
        <Link to="/" className="block text-center mb-8">
          <span className="font-extrabold text-[28px] text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <div className="bg-white rounded-[24px] shadow-iwosan-xl p-8 md:p-10">
          <h1 className="text-[28px] text-center">Creer un compte</h1>
          <p className="text-center text-[14px] text-[var(--color-text-muted)] mt-1">
            Rejoignez la communaute Iwosan
          </p>

          <div className="mt-7">
            <p className="text-[13px] font-semibold mb-3">Je suis...</p>
            <div className="space-y-2">
              {roles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition ${role === item.id ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border)] hover:border-[var(--brand-primary)]"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === item.id ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)] text-[var(--brand-primary)]"}`}
                  >
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

          {role && (
            <form className="mt-7 space-y-4 animate-in fade-in duration-300" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Prenom"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  className="h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]"
                />
                <input
                  placeholder="Nom"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  className="h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]"
              />
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none bg-white"
              >
                <option>Senegal</option>
                <option>Mali</option>
                <option>Cote d'Ivoire</option>
                <option>Cameroun</option>
                <option>Nigeria</option>
              </select>
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]"
              />
              <div className="h-1 rounded-full bg-[var(--brand-border-light)] overflow-hidden">
                <div className="h-full w-2/3 bg-[var(--brand-primary)]" />
              </div>
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]"
              />
              <label className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-1 accent-[var(--brand-primary)]"
                />{" "}
                J'accepte les CGU et la politique de confidentialite
              </label>
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                  {error}
                </p>
              )}
              {message && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Inscription..." : "S'inscrire"}
              </button>
            </form>
          )}

          <div className="my-6 flex items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
            <div className="flex-1 h-px bg-[var(--brand-border-light)]" /> ou continuer avec{" "}
            <div className="flex-1 h-px bg-[var(--brand-border-light)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="h-11 rounded-lg border border-[var(--brand-border)] font-semibold text-[14px] hover:bg-[var(--brand-surface-alt)]">
              Google
            </button>
            <button className="h-11 rounded-lg bg-[#1877F2] text-white font-semibold text-[14px]">
              Facebook
            </button>
          </div>
          <p className="mt-6 text-center text-[14px] text-[var(--color-text-muted)]">
            Deja inscrit ?{" "}
            <Link to="/connexion" className="font-semibold text-[var(--brand-primary)]">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
