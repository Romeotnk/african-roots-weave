import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminForumActions, useAdminForumComments, useAdminForumQuestions } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/communaute/forum")({
  head: () => ({ meta: [{ title: "Admin forum - IWOSAN" }] }),
  component: AdminForum,
});

type Question = {
  id: string;
  title: string;
  category: string;
  isHidden: boolean;
  isClosed: boolean;
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
  const [tab, setTab] = useState<"questions" | "comments">("questions");
  const questionsQuery = useAdminForumQuestions();
  const commentsQuery = useAdminForumComments();
  const { hideQuestion, hideComment } = useAdminForumActions();
  const [notice, setNotice] = useState("");

  const questions = (questionsQuery.data?.data ?? []) as Question[];
  const comments = (commentsQuery.data?.data ?? []) as Comment[];

  return (
    <AdminLayout title="Forum" description="Questions, réponses et commentaires de la communauté.">
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="mb-4 flex gap-2">
        <button type="button" onClick={() => setTab("questions")} className={`rounded-full px-4 py-1.5 text-[12px] font-bold ${tab === "questions" ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}>
          Questions
        </button>
        <button type="button" onClick={() => setTab("comments")} className={`rounded-full px-4 py-1.5 text-[12px] font-bold ${tab === "comments" ? "bg-emerald-400 text-[#111827]" : "bg-white/10 text-slate-300"}`}>
          Commentaires
        </button>
      </div>

      {tab === "questions" && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{["Titre", "Auteur", "Catégorie", "Votes", "Statut", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {questionsQuery.isLoading && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>}
              {!questionsQuery.isLoading && questions.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Aucune question.</td></tr>
              )}
              {questions.map((question) => (
                <tr key={question.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{question.title}</td>
                  <td className="px-4 py-3 text-slate-200">{question.author.firstName} {question.author.lastName}</td>
                  <td className="px-4 py-3 text-slate-200">{question.category}</td>
                  <td className="px-4 py-3 text-slate-200">{question.voteCount}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${question.isHidden ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {question.isHidden ? "Masquée" : "Visible"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={hideQuestion.isPending}
                      onClick={() =>
                        hideQuestion.mutate(
                          { id: question.id, hidden: !question.isHidden },
                          { onSuccess: () => setNotice(question.isHidden ? "Question republiée." : "Question masquée.") },
                        )
                      }
                      className={`rounded-full px-3 py-1 text-[12px] font-bold text-white disabled:opacity-50 ${question.isHidden ? "bg-emerald-500/80" : "bg-red-500/80"}`}
                    >
                      {question.isHidden ? "Republier" : "Masquer"}
                    </button>
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
              <tr>{["Contenu", "Auteur", "Cible", "Statut", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {commentsQuery.isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>}
              {!commentsQuery.isLoading && comments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Aucun commentaire.</td></tr>
              )}
              {comments.map((comment) => (
                <tr key={comment.id} className="border-t border-white/10">
                  <td className="max-w-[360px] truncate px-4 py-3 text-slate-200">{comment.content}</td>
                  <td className="px-4 py-3 text-slate-200">{comment.author.firstName} {comment.author.lastName}</td>
                  <td className="px-4 py-3 text-slate-400">{comment.targetType}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${comment.isHidden ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {comment.isHidden ? "Masqué" : "Visible"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={hideComment.isPending}
                      onClick={() =>
                        hideComment.mutate(
                          { id: comment.id, hidden: !comment.isHidden },
                          { onSuccess: () => setNotice(comment.isHidden ? "Commentaire republié." : "Commentaire masqué.") },
                        )
                      }
                      className={`rounded-full px-3 py-1 text-[12px] font-bold text-white disabled:opacity-50 ${comment.isHidden ? "bg-emerald-500/80" : "bg-red-500/80"}`}
                    >
                      {comment.isHidden ? "Republier" : "Masquer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
