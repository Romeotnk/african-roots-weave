import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Clock, HelpCircle, Paperclip, Send, Ticket as TicketIcon } from "lucide-react";
import type { BackendArticle } from "@/components/editorial/ArticleListPage";
import { toRecipe } from "@/components/editorial/RecipeListPage";
import { faqCategories } from "@/data/help";
import { useArticles } from "@/hooks/useContentApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useCreateTicket, useMyTickets, useUploadTicketAttachments } from "@/hooks/useTicketsApi";
import { useAuth } from "@/lib/auth/AuthContext";

const ticketStatusLabels: Record<string, string> = { OPEN: "Ouvert", IN_PROGRESS: "En cours", RESOLVED: "Résolu", CLOSED: "Fermé" };
type MyTicketSummary = { id: string; subject: string; status: string; createdAt: string };

export const Route = createFileRoute("/aide")({
  head: () => ({ meta: [{ title: "Centre d'aide - IWOSAN" }] }),
  component: HelpCenter,
});

function HelpCenter() {
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const knowledgeBaseRecipes = useMemo(
    () =>
      ((recipesQuery.data?.articles ?? []) as BackendArticle[])
        .map(toRecipe)
        .filter((item): item is NonNullable<ReturnType<typeof toRecipe>> => Boolean(item)),
    [recipesQuery.data],
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

    if (cleanSubject.length < 5) {
      setFormMessage("Ajoutez un sujet plus précis pour votre demande.");
      return;
    }

    if (cleanMessage.length < 20) {
      setFormMessage("Décrivez le problème en au moins 20 caractères.");
      return;
    }

    if (!user) {
      setFormMessage("Connectez-vous pour ouvrir un ticket support.");
      return;
    }

    createTicket.mutate(
      { subject: cleanSubject, category, content: cleanMessage, attachments: attachmentUrl ? [attachmentUrl] : undefined },
      {
        onSuccess: () => {
          setFormMessage(`Ticket créé dans la catégorie ${category}. Retrouvez-le dans votre espace tickets.`);
          setSubject("");
          setMessage("");
          setAttachmentName("");
          setAttachmentUrl("");
        },
        onError: (error) => setFormMessage(error instanceof Error ? error.message : "Impossible de créer le ticket."),
      },
    );
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-10">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Support</p>
          <h1 className="mt-2 text-[36px] md:text-[48px]">Centre d'aide</h1>
          <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
            Base de connaissances, FAQ et tickets support pour suivre vos demandes.
          </p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher dans la FAQ..."
            className="mt-6 h-12 w-full max-w-2xl rounded-full border border-[var(--brand-border)] bg-white px-5"
          />
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {knowledgeBaseRecipes.length > 0 && (
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[20px] font-bold">Base de connaissances — Recettes santé</h2>
                <Link to="/recettes-sante" className="text-[13px] font-semibold text-[var(--brand-primary)]">
                  Voir toutes les recettes
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
              <h2 className="mt-3 text-[20px] font-bold">Aucun résultat</h2>
              <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                Essayez avec un autre mot-clé ou ouvrez un ticket support.
              </p>
            </div>
          )}

          {filteredFaq.map((categoryItem) => (
            <div key={categoryItem.name} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="flex items-center gap-2 text-[20px] font-bold"><HelpCircle size={20} /> {categoryItem.name}</h2>
              <div className="mt-4 divide-y divide-[var(--brand-border-light)]">
                {categoryItem.items.map((item) => (
                  <details key={item.question} className="group py-3">
                    <summary className="cursor-pointer list-none font-semibold">{item.question}</summary>
                    <p className="mt-2 text-[14px] leading-6 text-[var(--color-text-secondary)]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="text-[20px] font-bold">Ouvrir un ticket</h2>
          <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
            Décrivez votre demande. Elle apparaîtra dans votre espace tickets avec son statut.
          </p>
          <button
            type="button"
            onClick={() => {
              setTicketOpen((current) => !current);
              setFormMessage("");
            }}
            className="mt-4 h-11 w-full rounded-full bg-[var(--brand-primary)] text-[13px] font-semibold text-white"
          >
            {ticketOpen ? "Fermer le formulaire" : "Nouveau ticket"}
          </button>
          {ticketOpen && (
            <form onSubmit={submitTicket} className="mt-5 space-y-3">
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Sujet"
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-3"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3"
              >
                <option>Marketplace</option>
                <option>Compte</option>
                <option>Pharmacopée</option>
                <option>Commandes</option>
              </select>
              <textarea
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Message"
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
                      setFormMessage("Pièce jointe ajoutée au ticket.");
                    },
                    onError: (error) => {
                      setAttachmentName("");
                      setFormMessage(error instanceof Error ? error.message : "Impossible d'envoyer la pièce jointe.");
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
                <Paperclip size={14} /> {uploadAttachments.isPending ? "Envoi en cours..." : "Ajouter une pièce jointe"}
              </button>
              {attachmentName && <p className="text-[12px] text-[var(--color-text-muted)]">{attachmentName}</p>}
              <button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] text-[12px] font-semibold text-white">
                <Send size={14} /> Envoyer
              </button>
              {formMessage && (
                <p className={`rounded-lg p-3 text-[12px] ${formMessage.includes("créé") || formMessage.includes("ajoutée") ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                  {formMessage}
                </p>
              )}
            </form>
          )}
          {user && myTickets.length > 0 && (
            <div className="mt-5 border-t border-[var(--brand-border-light)] pt-4">
              <h3 className="flex items-center gap-2 text-[14px] font-bold"><TicketIcon size={16} /> Mes derniers tickets</h3>
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
            Voir mes tickets
          </Link>
        </aside>
      </section>
    </main>
  );
}