import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminTaxonomy, useTaxonomyActions } from "@/hooks/useTaxonomyApi";
import type { TaxonomyItem, TaxonomyScope } from "@/lib/api/taxonomy";

const scopeLabels: Record<TaxonomyScope, string> = {
  PROFESSIONAL_SPECIALTY: "Spécialités professionnelles (annuaire)",
  ARTICLE_CATEGORY: "Catégories d'articles (blog)",
};

export function TaxonomyManager() {
  const [scope, setScope] = useState<TaxonomyScope>("PROFESSIONAL_SPECIALTY");
  const taxonomyQuery = useAdminTaxonomy(scope);
  const { create, update, remove } = useTaxonomyActions(scope);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyItem | null>(null);
  const [notice, setNotice] = useState("");

  const items = taxonomyQuery.data ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(scopeLabels) as TaxonomyScope[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => { setScope(value); setNotice(""); }}
            className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${scope === value ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}
          >
            {scopeLabels[value]}
          </button>
        ))}
      </div>

      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="mb-5 flex gap-2">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nouvelle catégorie"
          className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
        />
        <button
          type="button"
          disabled={create.isPending || newName.trim().length < 2}
          onClick={() =>
            create.mutate(newName.trim(), {
              onSuccess: () => { setNewName(""); setNotice("Catégorie ajoutée."); },
              onError: (error) => setNotice(error instanceof Error ? error.message : "Impossible d'ajouter cette catégorie."),
            })
          }
          className="rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827] disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>

      {taxonomyQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {!taxonomyQuery.isLoading && items.length === 0 && <p className="text-[13px] text-slate-400">Aucune catégorie pour le moment.</p>}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2">
            {editingId === item.id ? (
              <input
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                className="h-9 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
              />
            ) : (
              <span className="text-[13px] font-semibold text-white">{item.name}</span>
            )}
            <div className="flex gap-2">
              {editingId === item.id ? (
                <>
                  <button
                    type="button"
                    disabled={update.isPending}
                    onClick={() =>
                      update.mutate(
                        { id: item.id, name: editingName.trim() },
                        { onSuccess: () => { setEditingId(null); setNotice("Catégorie mise à jour."); } },
                      )
                    }
                    className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-slate-200">
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { setEditingId(item.id); setEditingName(item.name); }}
                    className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-slate-200"
                  >
                    Modifier
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Supprimer « ${deleteTarget?.name ?? ""} » ?`}
        description="Les contenus déjà classés dans cette catégorie garderont leur valeur actuelle en texte, mais elle ne sera plus proposée dans les formulaires."
        danger
        confirmLabel="Supprimer"
        pending={remove.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          remove.mutate(deleteTarget.id, { onSuccess: () => { setNotice("Catégorie supprimée."); setDeleteTarget(null); } });
        }}
      />
    </div>
  );
}
