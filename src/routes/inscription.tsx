import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { User, Leaf, FlaskConical } from "lucide-react";

export const Route = createFileRoute("/inscription")({
  head: () => ({ meta: [{ title: "Inscription — IWOSAN" }] }),
  component: Inscription,
});

const roles = [
  { id: "user", label: "Utilisateur", desc: "Découvrir, acheter, échanger", Icon: User },
  { id: "pro", label: "Professionnel", desc: "Publier, vendre, consulter", Icon: Leaf },
  {
    id: "researcher",
    label: "Chercheur",
    desc: "Documenter, publier, étudier",
    Icon: FlaskConical,
  },
];

function Inscription() {
  const [role, setRole] = useState<string | null>(null);
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--brand-bg)]">
      <div className="w-full max-w-[480px]">
        <Link to="/" className="block text-center mb-8">
          <span className="font-extrabold text-[28px] text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <div className="bg-white rounded-[24px] shadow-iwosan-xl p-8 md:p-10">
          <h1 className="text-[28px] text-center">Créer un compte</h1>
          <p className="text-center text-[14px] text-[var(--color-text-muted)] mt-1">
            Rejoignez la communauté Iwosan
          </p>

          <div className="mt-7">
            <p className="text-[13px] font-semibold mb-3">Je suis...</p>
            <div className="space-y-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition ${role === r.id ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border)] hover:border-[var(--brand-primary)]"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === r.id ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)] text-[var(--brand-primary)]"}`}
                  >
                    <r.Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[14px]">{r.label}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)]">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {role && (
            <form className="mt-7 space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Prénom"
                  className="h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]"
                />
                <input
                  placeholder="Nom"
                  className="h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]"
              />
              <select className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none bg-white">
                <option>🇸🇳 Sénégal</option>
                <option>🇲🇱 Mali</option>
                <option>🇨🇮 Côte d'Ivoire</option>
                <option>🇨🇲 Cameroun</option>
                <option>🇳🇬 Nigeria</option>
              </select>
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]"
              />
              <div className="h-1 rounded-full bg-[var(--brand-border-light)] overflow-hidden">
                <div className="h-full w-2/3 bg-[var(--brand-primary)]" />
              </div>
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                className="w-full h-11 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]"
              />
              <label className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)]">
                <input type="checkbox" className="mt-1 accent-[var(--brand-primary)]" /> J'accepte
                les CGU et la politique de confidentialité
              </label>
              <button
                type="submit"
                className="w-full h-12 rounded-full bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-dark)]"
              >
                S'inscrire
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
            Déjà inscrit ?{" "}
            <Link to="/connexion" className="font-semibold text-[var(--brand-primary)]">
              Se connecter →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
