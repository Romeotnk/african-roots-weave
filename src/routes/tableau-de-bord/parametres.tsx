import { createFileRoute } from "@tanstack/react-router";
import { Bell, Globe2, LockKeyhole, Save, Settings } from "lucide-react";
import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";

export const Route = createFileRoute("/tableau-de-bord/parametres")({
  head: () => ({ meta: [{ title: "Parametres - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["user", "researcher", "professional", "admin", "super_admin"]}>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

type SettingsForm = {
  language: "fr" | "en" | "ar";
  timezone: string;
  emailNotifications: boolean;
  orderNotifications: boolean;
  forumNotifications: boolean;
  marketingEmails: boolean;
  profilePublic: boolean;
  twoFactor: boolean;
};

function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    language: "fr",
    timezone: "Africa/Abidjan",
    emailNotifications: true,
    orderNotifications: true,
    forumNotifications: true,
    marketingEmails: false,
    profilePublic: true,
    twoFactor: false,
  });
  const [message, setMessage] = useState("");

  const toggle = (key: keyof SettingsForm) => {
    setForm((current) => ({ ...current, [key]: !current[key] }));
    setMessage("");
  };

  const saveSettings = () => {
    setMessage("Parametres enregistres dans cette interface de test.");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <AccountBackLink />
          <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Compte</p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Parametres</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            Controlez les preferences principales, les notifications et les options de securite du compte.
          </p>
        </div>
      </section>

      <section className="container-iwosan grid gap-5 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex items-center gap-3">
              <Globe2 size={20} className="text-[var(--brand-primary)]" />
              <h2 className="text-[20px] font-bold">Region et langue</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
                Langue
                <select
                  value={form.language}
                  onChange={(event) => setForm((current) => ({ ...current, language: event.target.value as SettingsForm["language"] }))}
                  className="h-11 rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="fr">Francais</option>
                  <option value="en">English</option>
                  <option value="ar">Arabe</option>
                </select>
              </label>
              <label className="grid gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
                Fuseau horaire
                <select
                  value={form.timezone}
                  onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
                  className="h-11 rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="Africa/Abidjan">Afrique de l'Ouest</option>
                  <option value="Africa/Dakar">Dakar</option>
                  <option value="Europe/Paris">Paris</option>
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
              <ToggleRow label="Recevoir les emails importants" checked={form.emailNotifications} onClick={() => toggle("emailNotifications")} />
              <ToggleRow label="Alertes commandes et livraisons" checked={form.orderNotifications} onClick={() => toggle("orderNotifications")} />
              <ToggleRow label="Reponses forum et mentions" checked={form.forumNotifications} onClick={() => toggle("forumNotifications")} />
              <ToggleRow label="Conseils, offres et newsletter" checked={form.marketingEmails} onClick={() => toggle("marketingEmails")} />
            </div>
          </section>

          <section className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex items-center gap-3">
              <LockKeyhole size={20} className="text-[var(--brand-primary)]" />
              <h2 className="text-[20px] font-bold">Confidentialite et securite</h2>
            </div>
            <div className="mt-5 divide-y divide-[var(--brand-border-light)]">
              <ToggleRow label="Profil public dans l'annuaire" checked={form.profilePublic} onClick={() => toggle("profilePublic")} />
              <ToggleRow label="Double authentification" checked={form.twoFactor} onClick={() => toggle("twoFactor")} />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
          <Settings size={22} className="text-[var(--brand-primary)]" />
          <h2 className="mt-3 text-[20px] font-bold">Resume</h2>
          <div className="mt-4 space-y-3 text-[13px] text-[var(--color-text-secondary)]">
            <p><strong>Langue :</strong> {form.language.toUpperCase()}</p>
            <p><strong>Fuseau :</strong> {form.timezone}</p>
            <p><strong>Notifications :</strong> {form.emailNotifications ? "Actives" : "Limitees"}</p>
            <p><strong>Profil public :</strong> {form.profilePublic ? "Oui" : "Non"}</p>
          </div>
          {message && <p className="mt-4 rounded-[8px] bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-800">{message}</p>}
          <button
            type="button"
            onClick={saveSettings}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white"
          >
            <Save size={17} /> Enregistrer
          </button>
        </aside>
      </section>
    </main>
  );
}

function ToggleRow({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <p className="text-[14px] font-semibold">{label}</p>
      <button
        type="button"
        onClick={onClick}
        className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-[var(--brand-primary)]" : "bg-[var(--brand-border)]"}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}