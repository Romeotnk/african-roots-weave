import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Copy, Facebook, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { AdSlot } from "@/components/shared/AdSlot";
import { useArticle, useArticleComments, useArticles, useCreateArticleComment } from "@/hooks/useContentApi";
import { toArticle, type BackendArticle } from "@/components/editorial/ArticleListPage";
import type { ArticleSpace } from "@/lib/api/content";
import { useAuth } from "@/lib/auth/AuthContext";

export function ArticleDetailPage({ slug, fallbackSpace, backTo }: { slug: string; fallbackSpace?: string; backTo: string }) {
  const { t } = useTranslation();
  const articleQuery = useArticle(slug);
  const apiArticle = useMemo(() => {
    const data = articleQuery.data as BackendArticle | undefined;
    return data ? toArticle(data, fallbackSpace ?? data.space ?? "", t) : null;
  }, [articleQuery.data, fallbackSpace, t]);

  const relatedQuery = useArticles(apiArticle ? { space: apiArticle.space as ArticleSpace } : {});
  const apiRelated = useMemo(
    () =>
      ((relatedQuery.data?.articles ?? []) as BackendArticle[])
        .map((item) => toArticle(item, apiArticle?.space ?? "", t))
        .filter((item): item is NonNullable<typeof item> => Boolean(item) && item!.id !== apiArticle?.id)
        .slice(0, 3),
    [relatedQuery.data, apiArticle, t],
  );

  const { user } = useAuth();
  const commentsQuery = useArticleComments(apiArticle?.id ?? "");
  const createComment = useCreateArticleComment();
  const [shareNotice, setShareNotice] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [commentNotice, setCommentNotice] = useState("");

  if (articleQuery.isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[var(--brand-bg)] px-6 text-center">
        <p className="text-[14px] text-[var(--color-text-muted)]">{t("articleDetail.loading")}</p>
      </main>
    );
  }

  if (!apiArticle) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[var(--brand-bg)] px-6 text-center">
        <div>
          <h1 className="text-[28px] font-bold">{t("articleDetail.notFoundTitle")}</h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            {t("articleDetail.notFoundDesc")}
          </p>
          <Link to={backTo as never} className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white">
            {t("articleDetail.back")}
          </Link>
        </div>
      </main>
    );
  }

  const article = apiArticle;
  const related = apiRelated;
  const breadcrumbSpace = article.space === "Sante au quotidien" ? t("articleDetail.shortHealthSpace") : article.space;

  const submitComment = () => {
    if (!apiArticle) return;
    const content = commentBody.trim();
    if (content.length < 2) {
      setCommentNotice(t("articleDetail.commentTooShort"));
      return;
    }
    createComment.mutate(
      { articleId: apiArticle.id, content },
      {
        onSuccess: () => {
          setCommentBody("");
          setCommentNotice(t("articleDetail.commentPublished"));
        },
        onError: (error) => setCommentNotice(error instanceof Error ? error.message : t("articleDetail.commentPublishError")),
      },
    );
  };
  const shareArticle = (id: "whatsapp" | "facebook" | "copy", label: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(article.title);
    if (id === "copy") {
      navigator.clipboard?.writeText(url).catch(() => undefined);
      setShareNotice(t("articleDetail.linkCopied"));
      return;
    }
    const target = id === "whatsapp" ? `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` : `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(target, "_blank", "noopener,noreferrer");
    setShareNotice(t("articleDetail.shareOpening", { label }));
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="relative min-h-[440px] bg-[var(--brand-primary-dark)] text-white">
        <img src={article.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative container-iwosan py-12 md:py-20">
          <Link
            to={backTo as never}
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/75 transition hover:text-white"
          >
            <ArrowLeft size={15} /> {t("articleDetail.back")}
          </Link>
          <nav className="flex flex-wrap gap-2 text-[13px] text-white/75">
            <Link to="/">{t("articleDetail.home")}</Link>
            <span>&gt;</span>
            <span>{breadcrumbSpace}</span>
            <span>&gt;</span>
            <span>{article.category}</span>
          </nav>
          <h1 className="mt-6 max-w-4xl text-[34px] leading-tight text-white md:text-[54px]">{article.title}</h1>
          <p className="mt-4 max-w-2xl text-white/80">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px] text-white/75">
            <img src={article.authorAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-semibold text-white">{article.authorName}</span>
            <span>{article.authorSpecialty}</span>
            <span>{article.readTime} min</span>
            <span>{new Intl.DateTimeFormat("fr-FR").format(new Date(article.date))}</span>
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <article className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6 md:p-8">
          <div
            className="prose max-w-none text-[var(--color-text-secondary)]"
            dangerouslySetInnerHTML={{ __html: article.body ?? article.excerpt }}
          />

          <AdSlot position="article_bottom" className="mt-8" />

          <div className="mt-8 rounded-[12px] bg-[var(--brand-surface-alt)] p-5">
            <h2 className="text-[18px] font-bold">{t("articleDetail.author")}</h2>
            <div className="mt-4 flex gap-4">
              <img src={article.authorAvatar} alt="" className="h-16 w-16 rounded-full object-cover" />
              <div>
                <p className="font-bold">{article.authorName}</p>
                <p className="text-[13px] text-[var(--color-text-muted)]">{article.authorSpecialty}</p>
                {article.authorProfileId && (
                  <Link to="/pro/$id" params={{ id: article.authorProfileId }} className="mt-2 inline-flex text-[13px] font-semibold text-[var(--brand-primary)]">
                    {t("articleDetail.viewProfile")}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-[18px] font-bold">{t("articleDetail.comments")}</h2>
            <div className="mt-4 space-y-3">
              {apiArticle ? (
                <>
                  {commentsQuery.isLoading && <p className="text-[13px] text-[var(--color-text-muted)]">{t("articleDetail.loadingComments")}</p>}
                  {!commentsQuery.isLoading && (commentsQuery.data ?? []).length === 0 && (
                    <p className="text-[13px] text-[var(--color-text-muted)]">{t("articleDetail.noComments")}</p>
                  )}
                  {(commentsQuery.data ?? []).map((comment) => (
                    <div key={comment.id} className="rounded-lg bg-[var(--brand-surface-alt)] p-4 text-[13px]">
                      <p className="font-semibold">{comment.author.firstName} {comment.author.lastName}</p>
                      <p className="mt-1 text-[var(--color-text-secondary)]">{comment.content}</p>
                    </div>
                  ))}
                </>
              ) : (
                (article.comments ?? []).map((comment) => (
                  <div key={comment.id} className="rounded-lg bg-[var(--brand-surface-alt)] p-4 text-[13px]">
                    <p className="font-semibold">{comment.authorName}</p>
                    <p className="mt-1 text-[var(--color-text-secondary)]">{comment.content}</p>
                  </div>
                ))
              )}
              {apiArticle && (
                user ? (
                  <div className="rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">{t("articleDetail.leaveComment")}</p>
                    <div className="mt-3 grid gap-3">
                      <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} rows={4} placeholder={t("articleDetail.commentPlaceholder")} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3" />
                      <button type="button" onClick={submitComment} disabled={createComment.isPending} className="h-11 rounded-full bg-[var(--brand-primary)] px-4 font-semibold text-white disabled:opacity-50">
                        {createComment.isPending ? t("articleDetail.publishing") : t("articleDetail.publish")}
                      </button>
                      {commentNotice && <p className="text-[13px] text-[var(--brand-primary)]">{commentNotice}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-4 text-center text-[13px] text-[var(--color-text-muted)]">
                    <Link to="/connexion" className="font-semibold text-[var(--brand-primary)]">{t("articleDetail.loginToComment")}</Link>{t("articleDetail.loginToCommentSuffix")}
                  </div>
                )
              )}
            </div>
          </div>
        </article>

        <aside className="h-fit space-y-5">
          <AdSlot position="article_sidebar" />
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="mb-3 text-[15px] font-bold">{t("articleDetail.share")}</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: MessageCircle, id: "whatsapp" as const, label: "WhatsApp" },
                { icon: Facebook, id: "facebook" as const, label: "Facebook" },
                { icon: Copy, id: "copy" as const, label: t("articleDetail.copy") },
              ].map(({ icon: Icon, id, label }) => (
                <button key={id} type="button" onClick={() => shareArticle(id, label)} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-3 text-[12px] font-semibold">
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
            {shareNotice && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[12px] text-emerald-800">{shareNotice}</p>}
          </div>
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="mb-4 text-[15px] font-bold">{t("articleDetail.relatedArticles")}</h2>
            <div className="space-y-4">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
