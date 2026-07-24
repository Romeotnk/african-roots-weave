import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminReviewActions, useAdminReviews } from "@/hooks/useAdminApi";
import type { AdminReview } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/communaute/avis")({
  head: () => ({ meta: [{ title: "Admin avis - IWOSAN" }] }),
  component: AdminAvis,
});

function Stars({ rating }: { rating: number }) {
  return <span className="text-amber-300">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
}

function AdminAvis() {
  const reviewsQuery = useAdminReviews();
  const { hide } = useAdminReviewActions();
  const [hideTarget, setHideTarget] = useState<AdminReview | null>(null);
  const [notice, setNotice] = useState("");

  const reviews = reviewsQuery.data?.data ?? [];

  return (
    <AdminLayout title="Avis" description="Avis publiés sur les produits et professionnels.">
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      {reviewsQuery.isLoading && <p className="text-[13px] text-slate-400">Chargement...</p>}
      {reviewsQuery.isError && <p className="text-[13px] text-red-300">Impossible de charger les avis.</p>}

      {!reviewsQuery.isLoading && !reviewsQuery.isError && (
        <div className="overflow-x-auto rounded-[12px] border border-white/10">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="bg-white/10 text-slate-300">
              <tr>{["Auteur", "Cible", "Note", "Commentaire", "Statut", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {reviews.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Aucun avis publié.</td></tr>
              )}
              {reviews.map((review) => (
                <tr key={review.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{review.author.firstName} {review.author.lastName}</td>
                  <td className="px-4 py-3 text-slate-400">{review.targetType} · {review.targetId}</td>
                  <td className="px-4 py-3"><Stars rating={review.rating} /></td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-slate-200">{review.comment ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${review.isHidden ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {review.isHidden ? "Masqué" : "Visible"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {review.isHidden ? (
                      <button
                        type="button"
                        disabled={hide.isPending}
                        onClick={() => hide.mutate({ id: review.id, hidden: false }, { onSuccess: () => setNotice("Avis republié.") })}
                        className="rounded-full bg-emerald-500/80 px-3 py-1 text-[12px] font-bold text-white disabled:opacity-50"
                      >
                        Republier
                      </button>
                    ) : (
                      <button type="button" onClick={() => setHideTarget(review)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                        Masquer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(hideTarget)}
        onOpenChange={(open) => !open && setHideTarget(null)}
        title="Masquer cet avis ?"
        description="L'avis ne sera plus visible sur le site public."
        danger
        requireReason
        reasonLabel="Motif du masquage"
        confirmLabel="Masquer"
        pending={hide.isPending}
        onConfirm={(reason) => {
          if (!hideTarget || !reason) return;
          hide.mutate(
            { id: hideTarget.id, hidden: true, reason },
            { onSuccess: () => { setNotice("Avis masqué."); setHideTarget(null); } },
          );
        }}
      />
    </AdminLayout>
  );
}
