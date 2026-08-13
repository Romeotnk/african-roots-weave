import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { BookOpen, ChevronDown, Clock, HelpCircle, MessageCircle, Paperclip, Send, ShieldCheck, ShoppingBag, Ticket as TicketIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { BackendArticle } from "@/components/editorial/ArticleListPage";
import { toRecipe } from "@/components/editorial/RecipeListPage";
import { HeroSection } from "@/components/shared/HeroSection";
import { useArticles } from "@/hooks/useContentApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useCreateTicket, useMyTickets, useUploadTicketAttachments } from "@/hooks/useTicketsApi";
import { useAuth } from "@/lib/auth/AuthContext";

type MyTicketSummary = { id: string; subject: string; status: string; createdAt: string };

// Each FAQ category gets its own icon/color instead of a repeated generic "?"
// so the list is scannable at a glance. Falls back to a neutral style for any
// category id not in this map, so new categories never break the page.
const categoryStyles: Record<string, { icon: typeof HelpCircle; className: string }> = {
  accountSecurity: { icon: ShieldCheck, className: "bg-emerald-100 text-emerald-700" },
  marketplace: { icon: ShoppingBag, className: "bg-amber-100 text-amber-700" },
  editorialKnowledge: { icon: BookOpen, className: "bg-sky-100 text-sky-700" },
};
const defaultCategoryStyle = { icon: HelpCircle, className: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" };

function buildFaqCategories(t: TFunction) {
  return [
    {
      id: "accountSecurity",
      name: t("aide.faq.accountSecurity.name"),
      items: [
        { question: t("aide.faq.accountSecurity.q1"), answer: t("aide.faq.accountSecurity.a1") },
        { question: t("aide.faq.accountSecurity.q2"), answer: t("aide.faq.accountSecurity.a2") },
      ],
    },
    {
      id: "marketplace",
      name: t("aide.faq.marketplace.name"),
      items: [
        { question: t("aide.faq.marketplace.q1"), answer: t("aide.faq.marketplace.a1") },
        { question: t("aide.faq.marketplace.q2"), answer: t("aide.faq.marketplace.a2") },
      ],
    },
    {
      id: "editorialKnowledge",
      name: t("aide.faq.editorialKnowledge.name"),
      items: [{ question: t("aide.faq.editorialKnowledge.q1"), answer: t("aide.faq.editorialKnowledge.a1") }],
    },
  ];
}

export const Route = createFileRoute("/aide")({
  head: () => ({ meta: [{ title: "Centre d'aide - IWOSAN" }] }),
  component: HelpCenter,
});

function HelpCenter() {
  const { t } = useTranslation();
  const faqCategories = useMemo(() => buildFaqCategories(t), [t]);
  const categoryOptions = useMemo(
    () => [
      { value: "Marketplace", label: t("aide.categoryMarketplace") },
      { value: "Compte", label: t("aide.categoryAccount") },
      { value: "Pharmacopée", label: t("aide.categoryPharmacopoeia") },
      { value: "Commandes", label: t("aide.categoryOrders") },
    ],
    [t],
  );
  const ticketStatusLabels: Record<string, string> = {
    OPEN: t("aide.ticketStatusOpen"),
    IN_PROGRESS: t("aide.ticketStatusInProgress"),
    RESOLVED: t("aide.ticketStatusResolved"),
    CLOSED: t("aide.ticketStatusClosed"),
  };
  const { user } = useAuth();
  const createTicket = useCreateTicket();
  const uploadAttachments = useUploadTicketAttachments();
  const recipesQuery = useArticles({ space: "RECETTES_SANTE", page: 1, limit: 4 });
  const myTicketsQuery = useMyTickets();
  const [query, setQuery] = useState("");
  const [ticketOpen, setTicketOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Marketplace");
  const [message, setMessage] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formMessageIsSuccess, setFormMessageIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const knowledgeBaseRecipes = useMemo(
    () =>
      ((recipesQuery.data?.articles ?? []) as BackendArticle[])
        .map((article) => toRecipe(article, t))
        .filter((item): item is NonNullable<ReturnType<typeof toRecipe>> => Boolean(item)),
    [recipesQuery.data, t],
  );
  const myTickets = ((myTicketsQuery.data?.data ?? []) as MyTicketSummary[]).slice(0, 3);

  const filteredFaq = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    return faqCategories
      .map((categoryItem) => ({
        ...categoryItem,
        items: categoryItem.items.filter((item) =>
          !normalized || `${item.question} ${item.answer} ${categoryItem.name}`.toLowerCase().includes(normalized),
        ),
      }))
      .filter((categoryItem) => categoryItem.items.length > 0);
  }, [debouncedQuery]);

  const submitTicket = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    setFormMessageIsSuccess(false);

    if (cleanSubject.length < 5) {
      setFormMessage(t("aide.subjectTooShort"));
      return;
    }

    if (cleanMessage.length < 20) {
      setFormMessage(t("aide.messageTooShort"));
      return;
    }

    if (!user) {
      setFormMessage(t("aide.loginToOpenTicket"));
      return;
    }

    createTicket.mutate(
      { subject: cleanSubject, category, content: cleanMessage, attachments: attachmentUrl ? [attachmentUrl] : undefined },
      {
        onSuccess: () => {
          setFormMessage(t("aide.ticketCreated", { category }));
          setFormMessageIsSuccess(true);
          setSubject("");
          setMessage("");
          setAttachmentName("");
          setAttachmentUrl("");
        },
        onError: (error) => setFormMessage(error instanceof Error ? error.message : t("aide.ticketCreateError")),
      },
    );
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <HeroSection
        image="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1920&q=80"
        badge={t("aide.heroBadge")}
        title={t("aide.heroTitle")}
        subtitle={t("aide.heroSubtitle")}
        size="md"
      >
        <div className="mx-auto max-w-2xl">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("aide.searchPlaceholder")}
            className="h-12 w-full rounded-full border-none bg-white px-5 text-[var(--color-text-primary)] outline-none"
          />
        </div>
      </HeroSection>

      <section className="container-iwosan grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {knowledgeBaseRecipes.length > 0 && (
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[20px] font-bold">{t("aide.knowledgeBaseTitle")}</h2>
                <Link to="/recettes-sante" className="text-[13px] font-semibold text-[var(--brand-primary)]">
                  {t("aide.seeAllRecipes")}
                </Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {knowledgeBaseRecipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    to="/recettes-sante/$slug"
                    params={{ slug: recipe.slug }}
                    className="rounded-lg border border-[var(--brand-border-light)] p-4 transition hover:border-[var(--brand-primary)]"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="rounded-full bg-[var(--brand-primary-subtle)] px-2 py-0.5 font-semibold text-[var(--brand-primary)]">{recipe.type}</span>
                      <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)]"><Clock size={12} /> {recipe.prepTime}</span>
                    </div>
                    <p className="mt-2 text-[15px] font-bold text-[var(--color-text-primary)]">{recipe.title}</p>
                    <p className="mt-1 line-clamp-2 text-[13px] text-[var(--color-text-muted)]">{recipe.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filteredFaq.length === 0 && (
            <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-8 text-center">
              <HelpCircle className="mx-auto text-[var(--brand-primary)]" size={28} />
              <h2 className="mt-3 text-[20px] font-bold">{t("aide.noResultsTitle")}</h2>
              <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                {t("aide.noResultsDesc")}
              </p>
            </div>
          )}

          {filteredFaq.map((categoryItem) => {
            const style = categoryStyles[categoryItem.id] ?? defaultCategoryStyle;
            return (
              <div key={categoryItem.id} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
                <h2 className="flex items-center gap-3 text-[18px] font-bold">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${style.className}`}>
                    <style.icon size={17} />
                  </span>
                  {categoryItem.name}
                </h2>
                <div className="mt-4 divide-y divide-[var(--brand-border-light)]">
                  {categoryItem.items.map((item) => (
                    <details key={item.question} className="group py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                        {item.question}
                        <ChevronDown size={16} className="shrink-0 text-[var(--color-text-muted)] transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-2 text-[14px] leading-6 text-[var(--color-text-secondary)]">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit space-y-5">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{t("aide.contactDirect")}</h2>
            <div className="mt-3 space-y-2">
              <a href="https://wa.me/221770000000" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] font-semibold text-[var(--brand-primary)]">
                <MessageCircle size={16} /> {t("aide.whatsappLabel")}
              </a>
              <a href="mailto:contact@iwosan.africa" className="flex items-center gap-2 text-[13px] font-semibold text-[var(--brand-primary)]">
                <Send size={16} /> contact@iwosan.africa
              </a>
            </div>
          </div>
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="text-[20px] font-bold">{t("aide.openTicket")}</h2>
          <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
            {t("aide.openTicketDesc")}
          </p>
          <button
            type="button"
            onClick={() => {
              setTicketOpen((current) => !current);
              setFormMessage("");
            }}
            className="mt-4 h-11 w-full rounded-full bg-[var(--brand-primary)] text-[13px] font-semibold text-white"
          >
            {ticketOpen ? t("aide.closeForm") : t("aide.newTicket")}
          </button>
          {ticketOpen && (
            <form onSubmit={submitTicket} className="mt-5 space-y-3">
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder={t("aide.subjectPlaceholder")}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-3"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <textarea
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t("aide.messagePlaceholder")}
                className="w-full rounded-lg border border-[var(--brand-border)] px-3 py-2"
              />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setAttachmentName(file.name);
                  setAttachmentUrl("");
                  setFormMessage("");
                  uploadAttachments.mutate([file], {
                    onSuccess: (urls) => {
                      setAttachmentUrl(urls[0] ?? "");
                      setFormMessage(t("aide.attachmentAdded"));
                      setFormMessageIsSuccess(true);
                    },
                    onError: (error) => {
                      setAttachmentName("");
                      setFormMessage(error instanceof Error ? error.message : t("aide.attachmentError"));
                      setFormMessageIsSuccess(false);
                    },
                  });
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAttachments.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[12px] font-semibold disabled:opacity-50"
              >
                <Paperclip size={14} /> {uploadAttachments.isPending ? t("aide.uploadingAttachment") : t("aide.addAttachment")}
              </button>
              {attachmentName && <p className="text-[12px] text-[var(--color-text-muted)]">{attachmentName}</p>}
              <button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] text-[12px] font-semibold text-white">
                <Send size={14} /> {t("aide.send")}
              </button>
              {formMessage && (
                <p className={`rounded-lg p-3 text-[12px] ${formMessageIsSuccess ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                  {formMessage}
                </p>
              )}
            </form>
          )}
          {user && myTickets.length > 0 && (
            <div className="mt-5 border-t border-[var(--brand-border-light)] pt-4">
              <h3 className="flex items-center gap-2 text-[14px] font-bold"><TicketIcon size={16} /> {t("aide.myLatestTickets")}</h3>
              <div className="mt-3 space-y-2">
                {myTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    to="/mon-compte/tickets"
                    className="block rounded-lg border border-[var(--brand-border-light)] px-3 py-2 text-[12px] hover:border-[var(--brand-primary)]"
                  >
                    <p className="font-semibold text-[var(--color-text-primary)]">{ticket.subject}</p>
                    <p className="mt-0.5 text-[var(--color-text-muted)]">{ticketStatusLabels[ticket.status] ?? ticket.status}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link to="/mon-compte/tickets" className="mt-4 inline-flex text-[13px] font-semibold text-[var(--brand-primary)]">
            {t("aide.seeMyTickets")}
          </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}