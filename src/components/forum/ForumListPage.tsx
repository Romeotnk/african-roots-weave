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

const allTags = Array.from(new Set(questions.flatMap((question) => question.tags))).sort((a, b) => a.localeCompare(b, "fr"));

function AnswerBlock({ answer }: { answer: NonNullable<(typeof questions)[number]["answerItems"]>[number] }) {
  return (
    <div className="rounded-2xl border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{answer.authorName}</p>
          <p className="text-[12px] text-[var(--color-text-muted)]">{new Date(answer.date).toLocaleDateString("fr-FR")}</p>
        </div>
        {answer.accepted && <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[11px] font-bold text-[var(--brand-primary)]">Réponse utile</span>}
      </div>
      <p className="mt-3 text-[14px] leading-7 text-[var(--color-text-secondary)]">{answer.body}</p>
    </div>
  );
}

function ForumQuestionPreview({ question }: { question: (typeof questions)[number] }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const answers = question.answerItems ?? [];
  const visibleAnswers = answers.slice(0, 2);
  const remaining = Math.max(0, answers.length - visibleAnswers.length);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [toast, setToast] = useState("");

  const publish = () => {
    setToast("Votre réponse a été publiée");
    setReplyOpen(false);
    setName("");
    setBody("");
  };

  return (
    <article className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 shadow-iwosan-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-terracotta)]">
            <span>{question.category}</span>
            {question.subcategory && <span>· {question.subcategory}</span>}
          </div>
          <h3 className="mt-2 text-[24px]">{question.title}</h3>
          <p className="mt-2 text-[14px] leading-7 text-[var(--color-text-secondary)]">{question.excerpt}</p>
        </div>
        <div className="text-right text-[12px] text-[var(--color-text-muted)]">
          <div>{question.answers} réponses</div>
          <div>{question.votes} votes</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {question.tags.map((tag) => <span key={tag} className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--brand-primary)]">#{tag}</span>)}
      </div>
      <div className="mt-5 space-y-3">
        {visibleAnswers.map((answer) => <AnswerBlock key={answer.id} answer={answer} />)}
        {remaining > 0 && <button className="text-[13px] font-semibold text-[var(--brand-primary)]">Voir toutes les réponses ({answers.length})</button>}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button onClick={() => setReplyOpen((v) => !v)} className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[13px] font-semibold text-white">Répondre</button>
        {toast && <span className="text-[13px] font-semibold text-[var(--brand-primary)]">{toast}</span>}
      </div>
      {replyOpen && (
        <div className="mt-4 rounded-2xl border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom (optionnel)" className="h-11 rounded-full border border-[var(--brand-border)] px-4 text-[13px]" />
            <div className="md:col-span-2">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Votre réponse" className="min-h-28 w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-[13px]" />
            </div>
          </div>
          <button onClick={publish} className="mt-3 rounded-full bg-[var(--brand-terracotta)] px-4 py-2 text-[13px] font-semibold text-white">Publier ma réponse</button>
        </div>
      )}
    </article>
  );
}

export function ForumListPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const debouncedSearch = useDebounce(search, 300);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    return [...questions].filter((question) => {
      const searchable = [question.title, question.excerpt, question.body ?? "", question.category, question.subcategory ?? "", ...question.tags].join(" ").toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesCategory = !selectedCategory || question.category === selectedCategory || question.subcategory === selectedCategory;
      const matchesTag = !selectedTag || question.tags.includes(selectedTag);
      const matchesTab = activeTab === "unanswered" ? question.answers === 0 : activeTab === "popular" ? question.votes >= 20 || question.views >= 500 : activeTab === "mine" ? question.authorName === "Issa K." : true;
      return matchesSearch && matchesCategory && matchesTag && matchesTab;
    }).sort((a, b) => {
      if (sortBy === "votes") return b.votes - a.votes;
      if (sortBy === "answers") return b.answers - a.answers;
      if (sortBy === "featured") return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.votes - a.votes;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [activeTab, debouncedSearch, selectedCategory, selectedTag, sortBy]);

  const hasFilters = Boolean(debouncedSearch || selectedCategory || selectedTag || activeTab !== "all" || sortBy !== "featured");

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--brand-terracotta)]">FORUM COMMUNAUTAIRE</p>
              <h1 className="mt-2 text-[34px] md:text-[46px]">Discutons-en</h1>
              <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">Questions, réponses visibles par tous, et publication sans friction pour encourager l'entraide.</p>
            </div>
            <Link to="/forum/nouvelle-question" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 font-semibold text-white"><Plus size={18} /> Poser une question</Link>
          </div>
        </div>
      </section>
      <section className="container-iwosan py-8">
        <div className="mb-6 flex flex-wrap gap-2">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`h-10 rounded-full px-4 text-[13px] font-semibold ${activeTab === tab.id ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--brand-border)] bg-white text-[var(--color-text-secondary)]"}`}>{tab.label}</button>)}</div>
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-[20px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold"><Filter size={16} /> Filtres</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Catégories</label>
                  <div className="space-y-2">{forumCategories.map((category) => <button key={category.name} onClick={() => setSelectedCategory((current) => (current === category.name ? "" : category.name))} className={`w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold ${selectedCategory === category.name ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)]"}`}>{category.name}</button>)}</div>
                </div>
                <div>
                  <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Tags</label>
                  <div className="flex flex-wrap gap-2">{allTags.map((tag) => <button key={tag} onClick={() => setSelectedTag((current) => (current === tag ? "" : tag))} className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${selectedTag === tag ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"}`}>#{tag}</button>)}</div>
                </div>
                {hasFilters && <button onClick={() => { setActiveTab("all"); setSearch(""); setSelectedCategory(""); setSelectedTag(""); setSortBy("featured"); }} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] text-[13px] font-semibold"><RotateCcw size={15} /> Effacer les filtres</button>}
              </div>
            </div>
          </aside>
          <div className="space-y-5">
            <div className="rounded-[20px] border border-[var(--brand-border-light)] bg-white p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <SearchBar placeholder="Rechercher dans le forum..." value={search} onChange={setSearch} />
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-12 rounded-full border border-[var(--brand-border)] bg-white px-4 text-[13px] font-semibold">{sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>
              </div>
            </div>
            <div className="space-y-4">{filteredQuestions.map((question) => <ForumQuestionPreview key={question.id} question={question} />)}</div>
            {filteredQuestions.length === 0 && <div className="rounded-[20px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center"><p className="font-bold">Aucune question trouvée</p></div>}
          </div>
        </div>
      </section>
    </main>
  );
}
