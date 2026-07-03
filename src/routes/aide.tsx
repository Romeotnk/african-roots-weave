import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HelpCircle, Paperclip, Send } from "lucide-react";
import { faqCategories } from "@/data/help";
import { useDebounce } from "@/hooks/useDebounce";

export const Route = createFileRoute("/aide")({
  head: () => ({ meta: [{ title: "Centre d'aide - IWOSAN" }] }),
  component: HelpCenter,
});

function HelpCenter() {
  const [query, setQuery] = useState("");
  const [ticketOpen, setTicketOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const filteredFaq = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    return faqCategories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          !normalized || `${item.question} ${item.answer} ${category.name}`.toLowerCase().includes(normalized),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [debouncedQuery]);

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-10">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Support</p>
          <h1 className="mt-2 text-[36px] md:text-[48px]">Centre d'aide</h1>
          <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
            Base de connaissances, FAQ et tickets support en interface mock jusqu'a la liaison API.
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
          {filteredFaq.map((category) => (
            <div key={category.name} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="flex items-center gap-2 text-[20px] font-bold"><HelpCircle size={20} /> {category.name}</h2>
              <div className="mt-4 divide-y divide-[var(--brand-border-light)]">
                {category.items.map((item) => (
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
          <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">Auth obligatoire en production. Ici, le flux est simule.</p>
          <button
            onClick={() => setTicketOpen((current) => !current)}
            className="mt-4 h-11 w-full rounded-full bg-[var(--brand-primary)] text-[13px] font-semibold text-white"
          >
            Nouveau ticket
          </button>
          {ticketOpen && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
              className="mt-5 space-y-3"
            >
              <input placeholder="Sujet" className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-3" />
              <select className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-3">
                <option>Marketplace</option>
                <option>Compte</option>
                <option>Pharmacopee</option>
                <option>Paiement</option>
              </select>
              <textarea rows={5} placeholder="Message" className="w-full rounded-lg border border-[var(--brand-border)] px-3 py-2" />
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[12px] font-semibold">
                <Paperclip size={14} /> Piece jointe
              </button>
              <button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] text-[12px] font-semibold text-white">
                <Send size={14} /> Envoyer
              </button>
              {submitted && <p className="rounded-lg bg-emerald-50 p-3 text-[12px] text-emerald-800">Ticket cree en mock.</p>}
            </form>
          )}
          <Link to="/mon-compte/tickets" className="mt-4 inline-flex text-[13px] font-semibold text-[var(--brand-primary)]">
            Voir mes tickets
          </Link>
        </aside>
      </section>
    </main>
  );
}
