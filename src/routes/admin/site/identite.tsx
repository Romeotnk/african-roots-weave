import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminConfig, useUpdateAdminConfig } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/site/identite")({
  head: () => ({ meta: [{ title: "Admin identite - IWOSAN" }] }),
  component: AdminIdentite,
});

const defaults = {
  "site.name": "IWOSAN",
  "site.tagline": "Plateforme panafricaine de médecine traditionnelle",
  "site.logoUrl": "",
  "site.faviconUrl": "",
  "site.primaryColor": "#1A5C2A",
  "site.secondaryColor": "#D4AF37",
  "site.customCss": "",
  "maintenance.enabled": "false",
  "maintenance.message": "Le site est actuellement en maintenance. Merci de revenir bientôt.",
  "maintenance.returnAt": "",
  "demo.hidden": "false",
};

function AdminIdentite() {
  const configQuery = useAdminConfig();
  const updateConfig = useUpdateAdminConfig();
  const [form, setForm] = useState(defaults);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!configQuery.data?.data) return;
    const byKey = Object.fromEntries(configQuery.data.data.map((row) => [row.key, row.value]));
    setForm((current) => ({
      ...current,
      ...Object.fromEntries(Object.keys(defaults).map((key) => [key, byKey[key] ?? current[key as keyof typeof defaults]])),
    }));
  }, [configQuery.data]);

  const field = (key: keyof typeof defaults) => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value })),
  });

  return (
    <AdminLayout title="Identité du site" description="Nom, logo, couleurs et CSS personnalisé de la plateforme.">
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Nom, logo et couleurs</h2>
          <div className="space-y-4">
            <label className="block text-[13px] text-slate-300">
              Nom du site
              <input {...field("site.name")} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            </label>
            <label className="block text-[13px] text-slate-300">
              Accroche
              <input {...field("site.tagline")} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            </label>
            <label className="block text-[13px] text-slate-300">
              URL du logo
              <input {...field("site.logoUrl")} placeholder="https://..." className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            </label>
            <label className="block text-[13px] text-slate-300">
              URL du favicon
              <input {...field("site.faviconUrl")} placeholder="https://..." className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-[13px] text-slate-300">
                Couleur primaire
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" value={form["site.primaryColor"]} onChange={(event) => setForm((current) => ({ ...current, "site.primaryColor": event.target.value }))} className="h-10 w-12 rounded border border-white/10 bg-transparent" />
                  <input {...field("site.primaryColor")} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
                </div>
              </label>
              <label className="block text-[13px] text-slate-300">
                Couleur secondaire
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" value={form["site.secondaryColor"]} onChange={(event) => setForm((current) => ({ ...current, "site.secondaryColor": event.target.value }))} className="h-10 w-12 rounded border border-white/10 bg-transparent" />
                  <input {...field("site.secondaryColor")} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
                </div>
              </label>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Aperçu</h2>
          <div className="rounded-lg bg-white p-4 text-[#111827]">
            <div className="flex items-center justify-between border-b pb-3">
              <strong>{form["site.name"] || "IWOSAN"}</strong>
              <button type="button" style={{ background: form["site.primaryColor"] }} className="rounded-full px-4 py-2 text-white">
                Bouton
              </button>
            </div>
            <p className="mt-4 rounded p-4" style={{ background: `${form["site.secondaryColor"]}22` }}>
              {form["site.tagline"] || "Accroche du site"}
            </p>
          </div>
          <label className="mt-4 block text-[13px] text-slate-300">
            CSS personnalisé (avancé)
            <textarea
              {...field("site.customCss")}
              placeholder="/* CSS personnalisé réservé aux admins techniques */"
              className="mt-1 min-h-32 w-full rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-[13px] text-white outline-none"
            />
          </label>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Mode maintenance</h2>
          <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-[13px] text-slate-300">
            Activer le mode maintenance (site public)
            <input
              type="checkbox"
              checked={form["maintenance.enabled"] === "true"}
              onChange={(event) => setForm((current) => ({ ...current, "maintenance.enabled": String(event.target.checked) }))}
              className="h-5 w-5 accent-emerald-400"
            />
          </label>
          <label className="mt-4 block text-[13px] text-slate-300">
            Message affiché aux visiteurs
            <textarea {...field("maintenance.message")} className="mt-1 min-h-20 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none" />
          </label>
          <label className="mt-4 block text-[13px] text-slate-300">
            Retour estimé (texte libre)
            <input {...field("maintenance.returnAt")} placeholder="Ex : dans quelques heures" className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
          </label>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Mode démo</h2>
          <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-[13px] text-slate-300">
            Masquer les comptes et contenus de démonstration (site public)
            <input
              type="checkbox"
              checked={form["demo.hidden"] === "true"}
              onChange={(event) => setForm((current) => ({ ...current, "demo.hidden": String(event.target.checked) }))}
              className="h-5 w-5 accent-emerald-400"
            />
          </label>
          <p className="mt-3 text-[12px] text-slate-500">
            Coche cette case pour cacher instantanément les professionnels, produits, articles,
            monographies, questions du forum, événements et formations de démonstration (créés par
            prisma/seed.ts) — comme si tout était supprimé. Décoche pour tout faire réapparaître.
            Rien n'est jamais réellement supprimé, les vrais comptes et contenus ne sont jamais
            concernés. Le changement peut prendre jusqu'à 15 secondes pour s'appliquer partout.
          </p>
        </AdminCard>
      </div>

      <button
        type="button"
        disabled={updateConfig.isPending}
        onClick={() => updateConfig.mutate(form, { onSuccess: () => setNotice("Identité du site mise à jour.") })}
        className="mt-6 rounded-full bg-emerald-400 px-5 py-2.5 text-[13px] font-bold text-[#111827] disabled:opacity-50"
      >
        {updateConfig.isPending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </AdminLayout>
  );
}
