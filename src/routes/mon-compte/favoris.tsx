import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, MessageCircle, ThumbsUp } from "lucide-react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useMyFavorites, useToggleFavorite } from "@/hooks/useForumApi";
import { toQuestion, type BackendQuestion } from "@/lib/forumMappers";

export const Route = createFileRoute("/mon-compte/favoris")({
  head: () => ({ meta: [{ title: "Mes favoris - IWOSAN" }] }),
  component: FavoritesPage,
});

type FavoriteAnswer = {
  id: string;
  content: string;
  question: { id: string; title: string };
};

function FavoritesPage() {
  const favoritesQuery = useMyFavorites("QUESTION");
  const answerFavoritesQuery = useMyFavorites("ANSWER");
  const toggleFavorite = useToggleFavorite();

  const favorites = ((favoritesQuery.data ?? []) as BackendQuestion[])
    .map(toQuestion)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const favoriteAnswers = (answerFavoritesQuery.data ?? []) as FavoriteAnswer[];

  return (
    <ProtectedRoute>
      <AccountLayout
        title="Mes favoris"
        description="Questions du forum que vous avez enregistrées pour les retrouver facilement."
      >
          {favoritesQuery.isLoading && <p className="text-[13px] text-[var(--color-text-muted)]">Chargement...</p>}

          {!favoritesQuery.isLoading && !answerFavoritesQuery.isLoading && favorites.length === 0 && favoriteAnswers.length === 0 && (
            <div className="rounded-[16px] border border-dashed border-[var(--brand-border)] bg-white p-10 text-center">
              <Bookmark className="mx-auto text-[var(--brand-primary)]" size={42} />
              <h2 className="mt-4 text-[24px] font-bold">Aucun favori pour le moment</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
                Ouvrez une question ou une réponse dans le forum et cliquez sur « Favori » pour la retrouver ici.
              </p>
              <Link to="/forum" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white">
                Aller au forum
              </Link>
            </div>
          )}

          {favorites.length > 0 && (
            <div className="space-y-3">
              {favorites.map((question) => (
                <article key={question.id} className="flex flex-col gap-3 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <Link to="/forum/$id" params={{ id: question.id }} className="font-bold text-[var(--color-text-primary)] hover:text-[var(--brand-primary)]">
                      {question.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
                      <span className="rounded-full bg-[var(--brand-primary-subtle)] px-2 py-1 font-semibold text-[var(--brand-primary)]">{question.category}</span>
                      <span className="inline-flex items-center gap-1"><ThumbsUp size={13} /> {question.votes}</span>
                      <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {question.answers}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite.mutate({ targetId: question.id })}
                    disabled={toggleFavorite.isPending}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold text-red-600 disabled:opacity-50"
                  >
                    <Bookmark size={14} className="fill-current" /> Retirer
                  </button>
                </article>
              ))}
            </div>
          )}

          {favoriteAnswers.length > 0 && (
            <div className="mt-8">
              <h2 className="text-[18px] font-bold">Réponses favorites</h2>
              <div className="mt-3 space-y-3">
                {favoriteAnswers.map((favoriteAnswer) => (
                  <article key={favoriteAnswer.id} className="flex flex-col gap-3 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <Link to="/forum/$id" params={{ id: favoriteAnswer.question.id }} className="font-bold text-[var(--color-text-primary)] hover:text-[var(--brand-primary)]">
                        {favoriteAnswer.question.title}
                      </Link>
                      <p className="mt-2 line-clamp-2 text-[13px] text-[var(--color-text-muted)]">{favoriteAnswer.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite.mutate({ targetId: favoriteAnswer.id, targetType: "ANSWER" })}
                      disabled={toggleFavorite.isPending}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold text-red-600 disabled:opacity-50"
                    >
                      <Bookmark size={14} className="fill-current" /> Retirer
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}
      </AccountLayout>
    </ProtectedRoute>
  );
}
