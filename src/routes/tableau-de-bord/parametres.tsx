import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Globe2, LockKeyhole, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { AppRole } from "@/lib/auth/AuthContext";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { useLanguage } from "@/components/LanguageProvider";
import { PROFESSIONAL_ACCOUNT_ROLES } from "@/lib/auth/roles";
import { useMeQuery, meQueryKey } from "@/hooks/useAuthApi";
import { updateMe } from "@/lib/api/auth";

export const Route = createFileRoute("/tableau-de-bord/parametres")({
  head: () => ({ meta: [{ title: "Paramètres - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={PROFESSIONAL_ACCOUNT_ROLES}>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

export function SettingsPage({ allowedRoles = PROFESSIONAL_ACCOUNT_ROLES }: { allowedRoles?: AppRole[] } = {}) {
  const queryClient = useQueryClient();
  const meQuery = useMeQuery();
  const { setLanguage: applyLanguage } = useLanguage();
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (meQuery.data?.language === "fr" || meQuery.data?.language === "en") setLanguage(meQuery.data.language);
  }, [meQuery.data?.language]);

  const updateLanguage = useMutation({
    mutationFn: (nextLanguage: "fr" | "en") => updateMe({ language: nextLanguage }),
    onSuccess: async (_response, nextLanguage) => {
      applyLanguage(nextLanguage);
      setMessage("Langue mise à jour.");
      await queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "Mise à jour impossible.");
    },
  });

  const saveSettings = () => {
    setMessage("");
    updateLanguage.mutate(language);
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Compte</p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Paramètres</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            Contrôlez les préférences principales, les notifications et les options de sécurité du compte.
          </p>
        </div>
      </section>

      <section className="container-iwosan grid gap-5 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex items-center gap-3">
              <Globe2 size={20} className="text-[var(--brand-primary)]" />
              <h2 className="text-[20px] font-bold">Langue</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
                Langue de l'interface
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as "fr" | "en")}
                  className="h-11 rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[var(--brand-primary)]" />
              <h2 className="text-[20px] font-bold">Notifications</h2>
            </div>
            <div className="mt-5 divide-y divide-[var(--brand-border-light)]">
              <ToggleRow label="Recevoir les emails importants" checked disabled comingSoon />
              <ToggleRow label="Alertes commandes et livraisons" checked disabled comingSoon />
              <ToggleRow label="Reponses forum et mentions" checked disabled comingSoon />
              <ToggleRow label="Conseils, offres et newsletter" checked={false} disabled comingSoon />
            </div>
          </section>

          <section className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex items-center gap-3">
              <LockKeyhole size={20} className="text-[var(--brand-primary)]" />
              <h2 className="text-[20px] font-bold">Confidentialité et sécurité</h2>
            </div>
            <div className="mt-5 divide-y divide-[var(--brand-border-light)]">
              <ToggleRow label="Profil public dans l'annuaire" checked disabled comingSoon />
              <ToggleRow label="Double authentification" checked={false} disabled comingSoon />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
          <Settings size={22} className="text-[var(--brand-primary)]" />
          <h2 className="mt-3 text-[20px] font-bold">Résumé</h2>
          <div className="mt-4 space-y-3 text-[13px] text-[var(--color-text-secondary)]">
            <p><strong>Langue :</strong> {language.toUpperCase()}</p>
          </div>
          {message && <p className="mt-4 rounded-[8px] bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-800">{message}</p>}
          <button
            type="button"
            onClick={saveSettings}
            disabled={updateLanguage.isPending}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            <Save size={17} /> {updateLanguage.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </aside>
      </section>
    </main>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  comingSoon,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <p className="flex items-center gap-2 text-[14px] font-semibold">
        {label}
        {comingSoon && (
          <span className="rounded-full bg-[var(--brand-surface-alt)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
            Bientôt disponible
          </span>
        )}
      </p>
      <button
        type="button"
        disabled={disabled}
        className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-[var(--brand-primary)]" : "bg-[var(--brand-border)]"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}
