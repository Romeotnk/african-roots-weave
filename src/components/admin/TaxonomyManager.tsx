import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminTaxonomy, useTaxonomyActions } from "@/hooks/useTaxonomyApi";
import type { TaxonomyItem, TaxonomyScope } from "@/lib/api/taxonomy";

function buildScopeLabels(t: TFunction): Record<TaxonomyScope, string> {
  return {
    PROFESSIONAL_SPECIALTY: t("admin.taxonomyManager.scopeProfessionalSpecialty"),
    ARTICLE_CATEGORY: t("admin.taxonomyManager.scopeArticleCategory"),
    PRODUCT_CATEGORY: t("admin.taxonomyManager.scopeProductCategory"),
  };
}

export function TaxonomyManager() {
  const { t } = useTranslation();
  const scopeLabels = buildScopeLabels(t);
  const [scope, setScope] = useState<TaxonomyScope>("PROFESSIONAL_SPECIALTY");
  const taxonomyQuery = useAdminTaxonomy(scope);
  const { create, update, remove } = useTaxonomyActions(scope);
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyItem | null>(null);
  const [notice, setNotice] = useState("");

  const items = taxonomyQuery.data ?? [];
  const isHierarchical = scope === "PRODUCT_CATEGORY";
  const topLevelItems = items.filter((item) => !item.parentId);
  const childrenOf = (parentId: string) => items.filter((item) => item.parentId === parentId);

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

      <div className="mb-5 flex flex-wrap gap-2">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder={isHierarchical ? t("admin.taxonomyManager.newCategoryOrSubcategory") : t("admin.taxonomyManager.newCategory")}
          className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
        />
        {isHierarchical && (
          <select
            value={newParentId}
            onChange={(event) => setNewParentId(event.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
          >
            <option value="">{t("admin.taxonomyManager.mainCategory")}</option>
            {topLevelItems.map((parent) => (
              <option key={parent.id} value={parent.id}>{t("admin.taxonomyManager.subcategoryOf", { name: parent.name })}</option>
            ))}
          </select>
        )}
        <button
          type="button"
          disabled={create.isPending || newName.trim().length < 2}
          onClick={() =>
            create.mutate(
              { name: newName.trim(), parentId: newParentId || undefined },
              {
                onSuccess: () => { setNewName(""); setNewParentId(""); setNotice(t("admin.taxonomyManager.categoryAdded")); },
                onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.taxonomyManager.addCategoryError")),
              },
            )
          }
          className="rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827] disabled:opacity-50"
        >
          {t("admin.taxonomyManager.add")}
        </button>
      </div>

      {taxonomyQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.taxonomyManager.loading")}</p>}
      {!taxonomyQuery.isLoading && items.length === 0 && <p className="text-[13px] text-slate-400">{t("admin.taxonomyManager.noCategories")}</p>}

      <div className="space-y-2">
        {(isHierarchical ? topLevelItems : items).map((item) => (
          <div key={item.id}>
            <TaxonomyRow
              item={item}
              editingId={editingId}
              editingName={editingName}
              setEditingId={setEditingId}
              setEditingName={setEditingName}
              update={update}
              setDeleteTarget={setDeleteTarget}
              setNotice={setNotice}
            />
            {isHierarchical &&
              childrenOf(item.id).map((child) => (
                <div key={child.id} className="ml-6 mt-2">
                  <TaxonomyRow
                    item={child}
                    editingId={editingId}
                    editingName={editingName}
                    setEditingId={setEditingId}
                    setEditingName={setEditingName}
                    update={update}
                    setDeleteTarget={setDeleteTarget}
                    setNotice={setNotice}
                  />
                </div>
              ))}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("admin.taxonomyManager.deleteConfirmTitle", { name: deleteTarget?.name ?? "" })}
        description={
          isHierarchical && deleteTarget && childrenOf(deleteTarget.id).length > 0
            ? t("admin.taxonomyManager.deleteWithChildrenDescription", { count: childrenOf(deleteTarget.id).length })
            : t("admin.taxonomyManager.deleteDescription")
        }
        danger
        confirmLabel={t("admin.taxonomyManager.delete")}
        pending={remove.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          remove.mutate(deleteTarget.id, { onSuccess: () => { setNotice(t("admin.taxonomyManager.categoryDeleted")); setDeleteTarget(null); } });
        }}
      />
    </div>
  );
}

function TaxonomyRow({
  item,
  editingId,
  editingName,
  setEditingId,
  setEditingName,
  update,
  setDeleteTarget,
  setNotice,
}: {
  item: TaxonomyItem;
  editingId: string | null;
  editingName: string;
  setEditingId: (id: string | null) => void;
  setEditingName: (name: string) => void;
  update: ReturnType<typeof useTaxonomyActions>["update"];
  setDeleteTarget: (item: TaxonomyItem) => void;
  setNotice: (message: string) => void;
}) {
  const { t } = useTranslation();
  const isEditing = editingId === item.id;
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2">
      {isEditing ? (
        <input
          value={editingName}
          onChange={(event) => setEditingName(event.target.value)}
          className="h-9 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
        />
      ) : (
        <span className="text-[13px] font-semibold text-white">{item.name}</span>
      )}
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <button
              type="button"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { id: item.id, name: editingName.trim() },
                  { onSuccess: () => { setEditingId(null); setNotice(t("admin.taxonomyManager.categoryUpdated")); } },
                )
              }
              className="rounded-full bg-emerald-400 px-3 py-1 text-[12px] font-bold text-[#111827] disabled:opacity-50"
            >
              {t("admin.taxonomyManager.save")}
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-slate-200">
              {t("admin.taxonomyManager.cancel")}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => { setEditingId(item.id); setEditingName(item.name); }}
              className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-slate-200"
            >
              {t("admin.taxonomyManager.edit")}
            </button>
            <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
              {t("admin.taxonomyManager.delete")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
