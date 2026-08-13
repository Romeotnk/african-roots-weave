import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Archive, CheckCircle2, Eye, FileText, Loader2, Plus, Search, Send, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useCreateArticle, useDeleteArticle, useMyArticles } from "@/hooks/useContentApi";
import { useTaxonomy } from "@/hooks/useTaxonomyApi";
import type { ArticleSpace, MyArticle } from "@/lib/api/content";

type DisplayStatus = "review" | "published" | "rejected";

const statusClasses: Record<DisplayStatus, string> = {
  review: "bg-amber-50 text-amber-700 border-amber-100",
  published: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
};

const getStatus = (article: MyArticle): DisplayStatus => {
  if (article.isPublished && article.isApproved) return "published";
  if (article.rejectedAt) return "rejected";
  return "review";
};

const formatDate = (value: string) => new Date(value).toLocaleDateString("fr-FR");
const excerptOf = (content: string) => content.replace(/<[^>]+>/g, "").slice(0, 140);

function BlogPage() {
  const { t } = useTranslation();
  const statusLabels: Record<DisplayStatus, string> = {
    review: t("dashboard.blog.statusReview"),
    published: t("dashboard.blog.statusPublished"),
    rejected: t("dashboard.blog.statusRejected"),
  };
  const spaceOptions: { value: ArticleSpace; label: string }[] = [
    { value: "SANTE_QUOTIDIEN", label: t("dashboard.blog.spaceDailyHealth") },
    { value: "RECETTES_SANTE", label: t("dashboard.blog.spaceHealthRecipes") },
  ];
  const spaceLabels: Record<ArticleSpace, string> = {
    SANTE_QUOTIDIEN: t("dashboard.blog.spaceDailyHealth"),
    RECETTES_SANTE: t("dashboard.blog.spaceHealthRecipes"),
    RITES_CULTURES: t("dashboard.blog.spaceRitesCultures"),
    PHARMACOPEE: t("dashboard.blog.spacePharmacopee"),
  };
  const { data: articles, isLoading, isError } = useMyArticles();
  const createArticle = useCreateArticle();
  const deleteArticle = useDeleteArticle();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DisplayStatus>("all");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [space, setSpace] = useState<ArticleSpace>("SANTE_QUOTIDIEN");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const categoriesQuery = useTaxonomy("ARTICLE_CATEGORY");
  const categories = categoriesQuery.data ?? [];

  const list = articles ?? [];

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return list.filter((article) => {
      const matchesStatus = statusFilter === "all" || getStatus(article) === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [article.title, spaceLabels[article.space]].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [list, query, statusFilter]);

  const publishedCount = list.filter((article) => getStatus(article) === "published").length;
  const reviewCount = list.filter((article) => getStatus(article) === "review").length;
  const totalViews = list.reduce((sum, article) => sum + article.views, 0);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (title.trim().length < 8) {
      setError(t("dashboard.blog.titleTooShort"));
      return;
    }
    if (content.trim().length < 40) {
      setError(t("dashboard.blog.contentTooShort"));
      return;
    }

    createArticle.mutate(
      { space, title: title.trim(), content: content.trim(), category: category || undefined },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setCategory("");
          setMessage(t("dashboard.blog.sentToModeration"));
        },
        onError: (mutationError) =>
          setError(mutationError instanceof Error ? mutationError.message : t("dashboard.blog.createError")),
      },
    );
  };

  const removeArticle = (id: string) => {
    setMessage("");
    setError("");
    deleteArticle.mutate(id, {
      onSuccess: () => setMessage(t("dashboard.blog.deleted")),
      onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : t("dashboard.blog.deleteError")),
    });
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <AccountLayout
        title={t("dashboard.blog.title")}
        description={t("dashboard.blog.description")}
        actions={
          <Link to="/sante-au-quotidien" className="btn-secondary h-11 px-5 text-[14px]">
            <Eye size={17} /> {t("dashboard.blog.viewPublicBlog")}
          </Link>
        }
      >
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={CheckCircle2} label={t("dashboard.blog.statPublished")} value={String(publishedCount)} />
            <StatCard icon={Send} label={t("dashboard.blog.statReview")} value={String(reviewCount)} />
            <StatCard icon={Eye} label={t("dashboard.blog.statViews")} value={String(totalViews)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
            <form onSubmit={handleCreate} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="text-[18px] font-bold">{t("dashboard.blog.newArticle")}</h2>
              <label className="mt-4 block text-[13px] font-bold text-[var(--color-text-primary)]">
                {t("dashboard.blog.titleLabel")}
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t("dashboard.blog.titlePlaceholder")}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </label>
              <label className="mt-4 block text-[13px] font-bold text-[var(--color-text-primary)]">
                {t("dashboard.blog.sectionLabel")}
                <select
                  value={space}
                  onChange={(event) => setSpace(event.target.value as ArticleSpace)}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                >
                  {spaceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-4 block text-[13px] font-bold text-[var(--color-text-primary)]">
                {t("dashboard.blog.categoryLabel")}
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="">{t("dashboard.blog.noCategory")}</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label className="mt-4 block text-[13px] font-bold text-[var(--color-text-primary)]">
                {t("dashboard.blog.contentLabel")}
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={6}
                  placeholder={t("dashboard.blog.contentPlaceholder")}
                  className="mt-2 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 py-2 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </label>
              <button type="submit" disabled={createArticle.isPending} className="btn-primary mt-5 h-11 w-full text-[14px]">
                <Plus size={17} /> {t("dashboard.blog.sendToModeration")}
              </button>
              {message && <p className="mt-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
              {error && <p className="mt-4 rounded-[8px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</p>}
            </form>

            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("dashboard.blog.searchPlaceholder")}
                    className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["all", "published", "review", "rejected"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`h-10 rounded-full px-4 text-[13px] font-semibold transition ${
                        statusFilter === status
                          ? "bg-[var(--brand-primary)] text-white"
                          : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {status === "all" ? t("dashboard.blog.all") : statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-10">
                    <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
                  </div>
                ) : isError ? (
                  <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
                    {t("dashboard.blog.loadError")}
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-8 text-center">
                    <FileText className="mx-auto text-[var(--brand-primary)]" size={34} />
                    <h2 className="mt-4 text-[20px] font-bold">{t("dashboard.blog.emptyTitle")}</h2>
                    <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("dashboard.blog.emptyDesc")}</p>
                  </div>
                ) : (
                  filteredArticles.map((article) => {
                    const status = getStatus(article);
                    return (
                      <article key={article.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">{article.title}</h2>
                              <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[status]}`}>{statusLabels[status]}</span>
                            </div>
                            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                              {spaceLabels[article.space]}{article.category ? ` · ${article.category}` : ""} - {formatDate(article.updatedAt)} - {article.views} {t("dashboard.blog.views")}
                            </p>
                            <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">{excerptOf(article.content)}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => removeArticle(article.id)}
                            disabled={deleteArticle.isPending}
                            className="inline-flex h-10 items-center gap-2 rounded-full bg-red-50 px-4 text-[13px] font-semibold text-red-700 hover:bg-red-100"
                          >
                            <Trash2 size={16} /> {t("dashboard.blog.delete")}
                          </button>
                          {status === "rejected" && (
                            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-100 px-4 text-[13px] font-semibold text-slate-600">
                              <Archive size={16} /> {t("dashboard.blog.reviseAndResend")}
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </div>
      </AccountLayout>
    </ProtectedRoute>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/tableau-de-bord/blog")({
  head: () => ({ meta: [{ title: "Mon blog - IWOSAN" }] }),
  component: BlogPage,
});
