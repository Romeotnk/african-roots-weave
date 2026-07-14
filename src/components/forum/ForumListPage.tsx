import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Plus, RotateCcw } from "lucide-react";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { forumCategories, questions } from "@/data/questions";
import { useDebounce } from "@/hooks/useDebounce";

const tabs = [
  { id: "all", label: "Toutes" },
  { id: "unanswered", label: "Non répondues" },
  { id: "popular", label: "Populaires" },
  { id: "recent", label: "Récentes" },
  { id: "mine", label: "Mes questions" },
];

const sortOptions = [
  { id: "recent", label: "Plus récent" },
  { id: "votes", label: "Plus voté" },
  { id: "answers", label: "Plus de réponses" },
  { id: "featured", label: "Vedettes en tête" },
];

const allTags = Array.from(new Set(questions.flatMap((question) => question.tags))).sort((a, b) => a.localeCompare(b));

export function ForumListPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const debouncedSearch = useDebounce(search, 300);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    const filtered = questions.filter((question) => {
      const searchable = [
        question.title,
        question.excerpt,
        question.body ?? "",
        question.category,
        question.subcategory ?? "",
        ...question.tags,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesCategory =
        !selectedCategory || question.category === selectedCategory || question.subcategory === selectedCategory;
      const matchesTag = !selectedTag || question.tags.includes(selectedTag);
      const matchesTab =
        activeTab === "unanswered"
          ? question.answers === 0
          : activeTab === "popular"
            ? question.votes >= 20 || question.views >= 500
            : activeTab === "recent"
              ? true
              : activeTab === "mine"
                ? question.authorName === "Issa K."
                : true;

      return matchesSearch && matchesCategory && matchesTag && matchesTab;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "votes") return b.votes - a.votes;
      if (sortBy === "answers") return b.answers - a.answers;
      if (sortBy === "featured") return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.votes - a.votes;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [activeTab, debouncedSearch, selectedCategory, selectedTag, sortBy]);

  const hasFilters = Boolean(debouncedSearch || selectedCategory || selectedTag || activeTab !== "all" || sortBy !== "featured");

  const resetFilters = () => {
    setActiveTab("all");
    setSearch("");
    setSelectedCategory("");
    setSelectedTag("");
    setSortBy("featured");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Forum Q&A</p>
              <h1 className="mt-2 text-[34px] md:text-[46px]">Discutons-en</h1>
              <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
                Questions, réponses validées, votes et signalements en interface mock jusqu'à la liaison API globale.
              </p>
            </div>
            <Link
              to="/forum/nouvelle-question"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 font-semibold text-white"
            >
              <Plus size={18} /> Poser une question
            </Link>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-10 rounded-full px-4 text-[13px] font-semibold ${
                activeTab === tab.id
                  ? "bg-[var(--brand-primary)] text-white"
                  : "border border-[var(--brand-border)] bg-white text-[var(--color-text-secondary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside data-filter-panel className="space-y-5">
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold">
                <Filter size={16} /> Filtres
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    Catégories
                  </label>
                  <div className="space-y-2">
                    {forumCategories.map((category) => (
                      <div key={category.name}>
                        <button
                          onClick={() => setSelectedCategory((current) => (current === category.name ? "" : category.name))}
                          className={`w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold ${
                            selectedCategory === category.name
                              ? "bg-[var(--brand-primary)] text-white"
                              : "bg-[var(--brand-surface-alt)]"
                          }`}
                        >
                          {category.name}
                        </button>
                        <div className="mt-1 flex flex-wrap gap-1 pl-2">
                          {category.children.map((child) => (
                            <button
                              key={child}
                              onClick={() => setSelectedCategory((current) => (current === child ? "" : child))}
                              className={`rounded-full px-2 py-1 text-[11px] ${
                                selectedCategory === child
                                  ? "bg-[var(--brand-primary)] text-white"
                                  : "bg-white text-[var(--color-text-muted)] ring-1 ring-[var(--brand-border)]"
                              }`}
                            >
                              {child}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag((current) => (current === tag ? "" : tag))}
                        className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                          selectedTag === tag
                            ? "bg-[var(--brand-primary)] text-white"
                            : "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] text-[13px] font-semibold"
                  >
                    <RotateCcw size={15} /> Effacer les filtres
                  </button>
                )}
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <SearchBar placeholder="Rechercher dans le forum..." value={search} onChange={setSearch} />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-12 rounded-full border border-[var(--brand-border)] bg-white px-4 text-[13px] font-semibold"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px] text-[var(--color-text-muted)]">
                <strong className="text-[var(--color-text-primary)]">{filteredQuestions.length}</strong> questions
                {debouncedSearch ? ` pour "${debouncedSearch}"` : ""}
              </p>
              {(selectedCategory || selectedTag) && (
                <div className="flex flex-wrap gap-2 text-[12px] font-semibold">
                  {selectedCategory && (
                    <button onClick={() => setSelectedCategory("")} className="rounded-full bg-white px-3 py-1">
                      x {selectedCategory}
                    </button>
                  )}
                  {selectedTag && (
                    <button onClick={() => setSelectedTag("")} className="rounded-full bg-white px-3 py-1">
                      x #{selectedTag}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
              {filteredQuestions.length === 0 && (
                <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
                  <p className="font-bold">Aucune question trouvée</p>
                  <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                    Essayez un autre tag, une catégorie plus large ou une recherche plus courte.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 h-10 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
                  >
                    Réinitialiser
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
