import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminConfig,
  useAdminForumActions,
  useAdminForumCategories,
  useAdminForumCategoryActions,
  useAdminForumComments,
  useAdminForumQuestions,
  useUpdateAdminConfig,
} from "@/hooks/useAdminApi";
import { useCloseForumQuestion, useFeatureForumQuestion } from "@/hooks/useForumApi";

export const Route = createFileRoute("/admin/communaute/forum")({
  head: () => ({ meta: [{ title: "Admin forum - IWOSAN" }] }),
  component: AdminForum,
});

const ROLE_OPTIONS = ["USER", "PROFESSIONAL", "ADMIN", "SUPER_ADMIN"];

type Question = {
  id: string;
  title: string;
  category: string;
  isHidden: boolean;
  isClosed: boolean;
  isFeatured: boolean;
  voteCount: number;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
};

type Comment = {
  id: string;
  content: string;
  targetType: string;
  isHidden: boolean;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
};

function AdminForum() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"questions" | "comments" | "categories" | "reglages">("questions");
  const questionsQuery = useAdminForumQuestions();
  const commentsQuery = useAdminForumComments();
  const { hideQuestion, hideComment } = useAdminForumActions();
  const closeQuestion = useCloseForumQuestion();
  const featureQuestion = useFeatureForumQuestion();
  const [notice, setNotice] = useState("");

  const questions = (questionsQuery.data?.data ?? []) as Question[];
  const comments = (commentsQuery.data?.data ?? []) as Comment[];

  return (
    <AdminLayout title={t("admin.forum.title")} description={t("admin.forum.description")}>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("questions")} className={`rounded-full px-4 py-1.5 text-[12px] font-bold ${tab === "questions" ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}>
          {t("admin.forum.tabQuestions")}
        </button>
        <button type="button" onClick={() => setTab("comments")} className={`rounded-full px-4 py-1.5 text-[12px] font-bold ${tab === "comments" ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}>
          {t("admin.forum.tabComments")}
        </button>
        <button type="button" onClick={() => setTab("categories")} className={`rounded-full px-4 py-1.5 text-[12px] font-bold ${tab === "categories" ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}>
          {t("admin.forum.tabCategories")}
        </button>
        <button type="button" onClick={() => setTab("reglages")} className={`rounded-full px-4 py-1.5 text-[12px] font-bold ${tab === "reglages" ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}>
          {t("admin.forum.tabSettings")}
        </button>
      </div>

      {tab === "questions" && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.forum.colTitle"), t("admin.forum.colAuthor"), t("admin.forum.colCategory"), t("admin.forum.colVotes"), t("admin.forum.colStatus"), t("admin.forum.colActions")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {questionsQuery.isLoading && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">{t("admin.forum.loading")}</td></tr>}
              {!questionsQuery.isLoading && questions.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">{t("admin.forum.noQuestions")}</td></tr>
              )}
              {questions.map((question) => (
                <tr key={question.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{question.title}</td>
                  <td className="px-4 py-3 text-slate-200">{question.author.firstName} {question.author.lastName}</td>
                  <td className="px-4 py-3 text-slate-200">{question.category}</td>
                  <td className="px-4 py-3 text-slate-200">{question.voteCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${question.isHidden ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                        {question.isHidden ? t("admin.forum.hidden") : t("admin.forum.visible")}
                      </span>
                      {question.isClosed && <span className="rounded-full bg-slate-500/20 px-2 py-1 text-[11px] font-bold text-slate-300">{t("admin.forum.closed")}</span>}
                      {question.isFeatured && <span className="rounded-full bg-amber-500/20 px-2 py-1 text-[11px] font-bold text-amber-300">{t("admin.forum.featured")}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={hideQuestion.isPending}
                        onClick={() =>
                          hideQuestion.mutate(
                            { id: question.id, hidden: !question.isHidden },
                            { onSuccess: () => setNotice(question.isHidden ? t("admin.forum.questionRepublished") : t("admin.forum.questionHidden")) },
                          )
                        }
                        className={`rounded-full px-3 py-1 text-[12px] font-bold text-white disabled:opacity-50 ${question.isHidden ? "bg-emerald-500/80" : "bg-red-500/80"}`}
                      >
                        {question.isHidden ? t("admin.forum.republish") : t("admin.forum.hide")}
                      </button>
                      <button
                        type="button"
                        disabled={closeQuestion.isPending}
                        onClick={() =>
                          closeQuestion.mutate(
                            { id: question.id, isClosed: !question.isClosed },
                            { onSuccess: () => setNotice(question.isClosed ? t("admin.forum.questionReopened") : t("admin.forum.questionClosed")) },
                          )
                        }
                        className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-slate-200 disabled:opacity-50"
                      >
                        {question.isClosed ? t("admin.forum.reopen") : t("admin.forum.close")}
                      </button>
                      <button
                        type="button"
                        disabled={featureQuestion.isPending}
                        onClick={() =>
                          featureQuestion.mutate(
                            { id: question.id, isFeatured: !question.isFeatured },
                            { onSuccess: () => setNotice(question.isFeatured ? t("admin.forum.questionUnfeatured") : t("admin.forum.questionFeatured")) },
                          )
                        }
                        className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-slate-200 disabled:opacity-50"
                      >
                        {question.isFeatured ? t("admin.forum.unfeature") : t("admin.forum.feature")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "comments" && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{[t("admin.forum.colContent"), t("admin.forum.colAuthor"), t("admin.forum.colTarget"), t("admin.forum.colStatus"), t("admin.forum.colActions")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {commentsQuery.isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.forum.loading")}</td></tr>}
              {!commentsQuery.isLoading && comments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{t("admin.forum.noComments")}</td></tr>
              )}
              {comments.map((comment) => (
                <tr key={comment.id} className="border-t border-white/10">
                  <td className="max-w-[360px] truncate px-4 py-3 text-slate-200">{comment.content}</td>
                  <td className="px-4 py-3 text-slate-200">{comment.author.firstName} {comment.author.lastName}</td>
                  <td className="px-4 py-3 text-slate-400">{comment.targetType}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${comment.isHidden ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {comment.isHidden ? t("admin.forum.hiddenMasc") : t("admin.forum.visible")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={hideComment.isPending}
                      onClick={() =>
                        hideComment.mutate(
                          { id: comment.id, hidden: !comment.isHidden },
                          { onSuccess: () => setNotice(comment.isHidden ? t("admin.forum.commentRepublished") : t("admin.forum.commentHidden")) },
                        )
                      }
                      className={`rounded-full px-3 py-1 text-[12px] font-bold text-white disabled:opacity-50 ${comment.isHidden ? "bg-emerald-500/80" : "bg-red-500/80"}`}
                    >
                      {comment.isHidden ? t("admin.forum.republish") : t("admin.forum.hide")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "categories" && <CategoriesPanel onNotice={setNotice} />}
      {tab === "reglages" && <SettingsPanel onNotice={setNotice} />}
    </AdminLayout>
  );
}

function CategoriesPanel({ onNotice }: { onNotice: (message: string) => void }) {
  const { t } = useTranslation();
  const categoriesQuery = useAdminForumCategories();
  const { create, remove } = useAdminForumCategoryActions();
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const categories = categoriesQuery.data?.data ?? [];
  const roots = categories.filter((category) => !category.parentId);
  const childrenOf = (parentId: string) => categories.filter((category) => category.parentId === parentId);

  const addCategory = () => {
    const name = newName.trim();
    if (!name) return;
    create.mutate(
      { name, parentId: newParentId || undefined },
      {
        onSuccess: () => {
          onNotice(t("admin.forum.categoryCreated", { name }));
          setNewName("");
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-[12px] border border-white/10 bg-white/[0.04] p-4">
        <label className="block text-[12px] font-semibold text-slate-300">
          {t("admin.forum.newCategory")}
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            className="mt-1 h-10 w-56 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
          />
        </label>
        <label className="block text-[12px] font-semibold text-slate-300">
          {t("admin.forum.parentCategoryOptional")}
          <select
            value={newParentId}
            onChange={(event) => setNewParentId(event.target.value)}
            className="mt-1 h-10 w-56 rounded-lg border border-white/10 bg-[#1a1a2e] px-3 text-[13px] text-white"
          >
            <option value="">{t("admin.forum.rootCategoryOption")}</option>
            {roots.map((root) => (
              <option key={root.id} value={root.id}>
                {root.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={create.isPending}
          onClick={addCategory}
          className="h-10 rounded-full bg-emerald-400 px-4 text-[12px] font-bold text-[#111827] disabled:opacity-50"
        >
          {t("admin.forum.add")}
        </button>
      </div>

      <div className="space-y-3">
        {categoriesQuery.isLoading && <p className="text-[13px] text-slate-400">{t("admin.forum.loading")}</p>}
        {roots.map((root) => (
          <div key={root.id} className="rounded-[12px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-white">
                {root.name} <span className="text-[12px] font-normal text-slate-400">{t("admin.forum.questionsCount", { count: root._count.questions })}</span>
              </p>
              <button
                type="button"
                onClick={() => setDeleteTarget({ id: root.id, name: root.name })}
                className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white"
              >
                {t("admin.forum.delete")}
              </button>
            </div>
            <div className="mt-3 ml-4 space-y-2 border-l border-white/10 pl-4">
              {childrenOf(root.id).map((child) => (
                <div key={child.id} className="flex items-center justify-between gap-3">
                  <p className="text-[13px] text-slate-300">
                    {child.name} <span className="text-[12px] text-slate-500">{t("admin.forum.questionsCount", { count: child._count.questions })}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: child.id, name: child.name })}
                    className="rounded-full bg-red-500/80 px-3 py-1 text-[11px] font-bold text-white"
                  >
                    {t("admin.forum.delete")}
                  </button>
                </div>
              ))}
              {childrenOf(root.id).length === 0 && <p className="text-[12px] text-slate-500">{t("admin.forum.noSubcategories")}</p>}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("admin.forum.deleteCategoryTitle", { name: deleteTarget?.name ?? "" })}
        description={t("admin.forum.deleteCategoryDesc")}
        danger
        confirmLabel={t("admin.forum.delete")}
        pending={remove.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          remove.mutate(deleteTarget.id, {
            onSuccess: () => {
              onNotice(t("admin.forum.categoryDeleted", { name: deleteTarget.name }));
              setDeleteTarget(null);
            },
          });
        }}
      />
    </div>
  );
}

function SettingsPanel({ onNotice }: { onNotice: (message: string) => void }) {
  const { t } = useTranslation();
  const configQuery = useAdminConfig();
  const updateConfig = useUpdateAdminConfig();
  const [restrictPosting, setRestrictPosting] = useState(false);
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [autoHideThreshold, setAutoHideThreshold] = useState("3");

  useEffect(() => {
    if (!configQuery.data?.data) return;
    const byKey = Object.fromEntries(configQuery.data.data.map((row) => [row.key, row.value]));
    setRestrictPosting(byKey["forum.restrictPosting"] === "true");
    setAllowedRoles((byKey["forum.allowedRoles"] ?? "").split(",").map((role) => role.trim()).filter(Boolean));
    setAutoHideThreshold(byKey["forum.autoHideReportThreshold"] ?? "3");
  }, [configQuery.data]);

  const toggleRole = (role: string) => {
    setAllowedRoles((current) => (current.includes(role) ? current.filter((item) => item !== role) : [...current, role]));
  };

  const save = () => {
    const threshold = Math.max(1, Number(autoHideThreshold) || 3);
    updateConfig.mutate(
      {
        "forum.restrictPosting": String(restrictPosting),
        "forum.allowedRoles": allowedRoles.join(","),
        "forum.autoHideReportThreshold": String(threshold),
      },
      { onSuccess: () => onNotice(t("admin.forum.settingsUpdated")) },
    );
  };

  return (
    <div className="rounded-[12px] border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-[16px] font-bold text-white">{t("admin.forum.postingRestrictionTitle")}</h2>
      <p className="mt-2 text-[13px] text-slate-400">
        {t("admin.forum.postingRestrictionDesc")}
      </p>
      <label className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-[13px] text-slate-300">
        {t("admin.forum.restrictPostingLabel")}
        <input
          type="checkbox"
          checked={restrictPosting}
          onChange={(event) => setRestrictPosting(event.target.checked)}
          className="h-5 w-5 accent-emerald-400"
        />
      </label>
      {restrictPosting && (
        <div className="mt-4">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">{t("admin.forum.allowedRolesLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${allowedRoles.includes(role) ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-white/10 pt-5">
        <h2 className="text-[16px] font-bold text-white">{t("admin.forum.antiSpamTitle")}</h2>
        <p className="mt-2 text-[13px] text-slate-400">
          {t("admin.forum.antiSpamDesc")}
        </p>
        <label className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-[13px] text-slate-300">
          {t("admin.forum.reportThresholdLabel")}
          <input
            type="number"
            min={1}
            value={autoHideThreshold}
            onChange={(event) => setAutoHideThreshold(event.target.value)}
            className="h-9 w-20 rounded-lg border border-white/10 bg-white/5 px-2 text-center text-white outline-none focus:border-emerald-400"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={updateConfig.isPending}
        onClick={save}
        className="mt-5 rounded-full bg-emerald-400 px-5 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
      >
        {updateConfig.isPending ? t("admin.forum.saving") : t("admin.forum.save")}
      </button>
    </div>
  );
}
