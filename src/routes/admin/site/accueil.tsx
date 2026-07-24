import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminConfig, useUpdateAdminConfig } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/site/accueil")({
  head: () => ({ meta: [{ title: "Admin accueil - IWOSAN" }] }),
  component: AdminAccueil,
});

const defaults = {
  "site.home.metaTitle": "IWOSAN - Plateforme panafricaine",
  "site.home.metaDescription": "Le savoir endogène africain, documenté, transmis, vivant.",
  "site.home.announcement": "",
};

function AdminAccueil() {
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

  return (
    <AdminLayout title="Accueil" description="Référencement et bandeau d'annonce de la page d'accueil.">
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Référencement (SEO)</h2>
          <div className="space-y-4">
            <label className="block text-[13px] text-slate-300">
              Titre de la page
              <input
                value={form["site.home.metaTitle"]}
                onChange={(event) => setForm((current) => ({ ...current, "site.home.metaTitle": event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
              />
            </label>
            <label className="block text-[13px] text-slate-300">
              Meta description
              <textarea
                value={form["site.home.metaDescription"]}
                onChange={(event) => setForm((current) => ({ ...current, "site.home.metaDescription": event.target.value }))}
                className="mt-1 min-h-24 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none"
              />
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Bandeau d'annonce</h2>
          <p className="mb-3 text-[13px] text-slate-400">
            Affiché en haut de la page d'accueil. Laisser vide pour ne rien afficher.
          </p>
          <textarea
            value={form["site.home.announcement"]}
            onChange={(event) => setForm((current) => ({ ...current, "site.home.announcement": event.target.value }))}
            placeholder="Ex : Nouvelle fonctionnalité disponible : la messagerie professionnelle."
            className="min-h-24 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none"
          />
          <p className="mt-4 text-[13px] text-slate-400">
            Le carrousel visuel de la page d'accueil se gère depuis{" "}
            <Link to="/admin/site/publicites" className="font-semibold text-emerald-300">
              Publicités → Carrousel d'accueil
            </Link>.
          </p>
        </AdminCard>
      </div>

      <button
        type="button"
        disabled={updateConfig.isPending}
        onClick={() => updateConfig.mutate(form, { onSuccess: () => setNotice("Page d'accueil mise à jour.") })}
        className="mt-6 rounded-full bg-emerald-400 px-5 py-2.5 text-[13px] font-bold text-[#111827] disabled:opacity-50"
      >
        {updateConfig.isPending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </AdminLayout>
  );
}
