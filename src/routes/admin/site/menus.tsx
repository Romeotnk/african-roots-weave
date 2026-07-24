import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminConfig, useUpdateAdminConfig } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/site/menus")({
  head: () => ({ meta: [{ title: "Admin menus - IWOSAN" }] }),
  component: AdminMenus,
});

type MenuLink = { to: string; label: string };

const configKeys = {
  header: "site.menus.header",
  footerNav: "site.menus.footerNav",
  footerEspaces: "site.menus.footerEspaces",
} as const;

const parseLinks = (value: string | undefined): MenuLink[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function MenuEditor({
  title,
  description,
  links,
  onChange,
}: {
  title: string;
  description: string;
  links: MenuLink[];
  onChange: (links: MenuLink[]) => void;
}) {
  return (
    <AdminCard>
      <h2 className="mb-1 text-[18px] font-bold text-white">{title}</h2>
      <p className="mb-4 text-[13px] text-slate-400">{description}</p>
      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={link.label}
              onChange={(event) => {
                const next = [...links];
                next[index] = { ...next[index], label: event.target.value };
                onChange(next);
              }}
              placeholder="Libellé"
              className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
            />
            <input
              value={link.to}
              onChange={(event) => {
                const next = [...links];
                next[index] = { ...next[index], to: event.target.value };
                onChange(next);
              }}
              placeholder="/chemin"
              className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(links.filter((_, i) => i !== index))}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-500/20 text-red-300"
              aria-label="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...links, { to: "/", label: "" }])}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-bold text-slate-200"
      >
        <Plus size={14} /> Ajouter un lien
      </button>
    </AdminCard>
  );
}

function AdminMenus() {
  const configQuery = useAdminConfig();
  const updateConfig = useUpdateAdminConfig();
  const [header, setHeader] = useState<MenuLink[]>([]);
  const [footerNav, setFooterNav] = useState<MenuLink[]>([]);
  const [footerEspaces, setFooterEspaces] = useState<MenuLink[]>([]);
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!configQuery.data?.data || loaded) return;
    const byKey = Object.fromEntries(configQuery.data.data.map((row) => [row.key, row.value]));
    setHeader(parseLinks(byKey[configKeys.header]));
    setFooterNav(parseLinks(byKey[configKeys.footerNav]));
    setFooterEspaces(parseLinks(byKey[configKeys.footerEspaces]));
    setLoaded(true);
  }, [configQuery.data, loaded]);

  const save = () => {
    updateConfig.mutate(
      {
        [configKeys.header]: JSON.stringify(header.filter((link) => link.label.trim() && link.to.trim())),
        [configKeys.footerNav]: JSON.stringify(footerNav.filter((link) => link.label.trim() && link.to.trim())),
        [configKeys.footerEspaces]: JSON.stringify(footerEspaces.filter((link) => link.label.trim() && link.to.trim())),
      },
      { onSuccess: () => setNotice("Menus mis à jour.") },
    );
  };

  return (
    <AdminLayout title="Menus" description="Navigation principale (en-tête) et colonnes du pied de page.">
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}
      <p className="mb-4 text-[13px] text-slate-400">
        Laisser un menu vide conserve la navigation par défaut du site.
      </p>

      <div className="grid gap-6 xl:grid-cols-2">
        <MenuEditor title="Navigation principale (en-tête)" description="Liens affichés dans la barre de navigation du site." links={header} onChange={setHeader} />
        <MenuEditor title="Pied de page — Navigation" description="Colonne « Navigation » du footer." links={footerNav} onChange={setFooterNav} />
        <MenuEditor title="Pied de page — Nos Espaces" description="Colonne « Nos Espaces » du footer." links={footerEspaces} onChange={setFooterEspaces} />
      </div>

      <button
        type="button"
        disabled={updateConfig.isPending}
        onClick={save}
        className="mt-6 rounded-full bg-emerald-400 px-5 py-2.5 text-[13px] font-bold text-[#111827] disabled:opacity-50"
      >
        {updateConfig.isPending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </AdminLayout>
  );
}
