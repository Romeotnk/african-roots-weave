import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, Plus, RotateCcw } from "lucide-react";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { Reveal, staggerDelay } from "@/components/shared/Reveal";
import { SearchBar } from "@/components/shared/SearchBar";
import { SimplePager } from "@/components/shared/SimplePager";
import { questions } from "@/data/questions";
import { useForumCategories, useForumQuestions } from "@/hooks/useForumApi";
import { useAuth } from "@/lib/auth/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { toQuestion, type BackendQuestion } from "@/lib/forumMappers";

const severityOptions = ["Léger", "Modéré", "Sévère"];

const tabIds = ["all", "unanswered", "popular", "recent", "mine"] as const;
const sortOptionIds = ["recent", "votes", "answers", "featured"] as const;

export function ForumListPage() {
  const { t } = useTranslation();
  const tabs = tabIds.map((id) => ({ id, label: t(`forum.tabs.${id}`) }));
  const sortOptions = sortOptionIds.map((id) => ({ id, label: t(`forum.sort.${id}`) }));
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const debouncedSearch = useDebounce(search, 300);
  const { user } = useAuth();
  const categoriesQuery = useForumCategories();
  const categories = categoriesQuery.data ?? [];

  const [page, setPage] = useState(1);
  const questionsQuery = useForumQuestions({
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(selectedTag ? { tag: selectedTag } : {}),
    ...(selectedSeverity ? { customFields: { severite: selectedSeverity } } : {}),
    page,
  });
  const pagination = questionsQuery.data?.pagination;
  const apiQuestions = useMemo(
    () => ((questionsQuery.data?.questions ?? []) as BackendQuestion[]).map(toQuestion).filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [questionsQuery.data],
  );
  const allQuestions = apiQuestions.length > 0 ? apiQuestions : questions;
  const allTags = useMemo(() => Array.from(new Set(allQuestions.flatMap((question) => question.tags))).sort((a, b) => a.localeCompare(b, "fr")), [allQuestions]);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    return [...allQuestions].filter((question) => {
      const searchable = [question.title, question.excerpt, question.body ?? "", question.category, question.subcategory ?? "", ...question.tags].join(" ").toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesCategory = !selectedCategory || question.category === selectedCategory || question.subcategory === selectedCategory;
      const matchesTag = !selectedTag || question.tags.includes(selectedTag);
      const matchesTab =
        activeTab === "unanswered"
          ? question.answers === 0
          : activeTab === "popular"
            ? question.votes >= 20 || question.views >= 500
            : activeTab === "mine"
              ? Boolean(user) && question.authorId === user?.id
              : true;
      return matchesSearch && matchesCategory && matchesTag && matchesTab;
    }).sort((a, b) => {
      if (sortBy === "votes") return b.votes - a.votes;
      if (sortBy === "answers") return b.answers - a.answers;
      if (sortBy === "featured") return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.votes - a.votes;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [activeTab, allQuestions, debouncedSearch, selectedCategory, selectedTag, sortBy, user]);

  const hasFilters = Boolean(debouncedSearch || selectedCategory || selectedTag || selectedSeverity || activeTab !== "all" || sortBy !== "featured");

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedTag, selectedSeverity]);

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--brand-terracotta)]">{t("forum.eyebrow")}</p>
              <h1 className="mt-2 text-[34px] md:text-[46px]">{t("forum.title")}</h1>
              <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">{t("forum.subtitle")}</p>
            </div>
            <Link to="/forum/nouvelle-question" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 font-semibold text-white"><Plus size={18} /> {t("forum.askQuestion")}</Link>
          </div>
        </div>
      </section>
      <section className="container-iwosan py-8">
        <div className="mb-6 flex flex-wrap gap-2">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`h-10 rounded-full px-4 text-[13px] font-semibold ${activeTab === tab.id ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--brand-border)] bg-white text-[var(--color-text-secondary)]"}`}>{tab.label}</button>)}</div>
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside data-filter-panel className="space-y-5">
            <div className="rounded-[20px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold"><Filter size={16} /> {t("forum.filters.title")}</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{t("forum.filters.categories")}</label>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div key={category.id}>
                        <button
                          onClick={() => setSelectedCategory((current) => (current === category.name ? "" : category.name))}
                          className={`w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold ${selectedCategory === category.name ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)]"}`}
                        >
                          {category.name}
                        </button>
                        {category.children && category.children.length > 0 && (
                          <div className="ml-3 mt-1 space-y-1 border-l border-[var(--brand-border-light)] pl-3">
                            {category.children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => setSelectedCategory((current) => (current === child.name ? "" : child.name))}
                                className={`w-full rounded-lg px-3 py-1.5 text-left text-[12px] font-semibold ${selectedCategory === child.name ? "bg-[var(--brand-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--brand-surface-alt)]"}`}
                              >
                                {child.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{t("forum.filters.severity")}</label>
                  <div className="flex flex-wrap gap-2">{severityOptions.map((severity) => <button key={severity} onClick={() => setSelectedSeverity((current) => (current === severity ? "" : severity))} className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${selectedSeverity === severity ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)]"}`}>{t(`forum.severity.${severity}`)}</button>)}</div>
                </div>
                <div>
                  <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{t("forum.filters.tags")}</label>
                  <div className="flex flex-wrap gap-2">{allTags.map((tag) => <button key={tag} onClick={() => setSelectedTag((current) => (current === tag ? "" : tag))} className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${selectedTag === tag ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"}`}>#{tag}</button>)}</div>
                </div>
                {hasFilters && <button onClick={() => { setActiveTab("all"); setSearch(""); setSelectedCategory(""); setSelectedTag(""); setSelectedSeverity(""); setSortBy("featured"); }} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] text-[13px] font-semibold"><RotateCcw size={15} /> {t("forum.filters.clear")}</button>}
              </div>
            </div>
          </aside>
          <div className="space-y-5">
            <div className="rounded-[20px] border border-[var(--brand-border-light)] bg-white p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <SearchBar placeholder={t("forum.searchPlaceholder")} value={search} onChange={setSearch} />
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-12 rounded-full border border-[var(--brand-border)] bg-white px-4 text-[13px] font-semibold">{sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>
              </div>
            </div>
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <Reveal key={question.id} delayMs={staggerDelay(index % 8, 45, 320)}>
                  <QuestionCard question={question} />
                </Reveal>
              ))}
            </div>
            {filteredQuestions.length === 0 && <div className="rounded-[20px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center"><p className="font-bold">{t("forum.notFound")}</p></div>}
            {!hasFilters && pagination && (
              <SimplePager page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
