import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/mes-commandes/$id/litige")({
  head: () => ({ meta: [{ title: "Litige - IWOSAN" }] }),
  component: DisputePage,
});

const reasons = [
  "Produit non recu",
  "Produit different de l'annonce",
  "Produit endommage",
  "Service non realise",
  "Autre probleme",
];

function DisputePage() {
  const { id } = Route.useParams();
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
            Commande {id}
          </p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Ouvrir un litige</h1>
        </div>
      </section>

      <section className="container-iwosan grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
          className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 space-y-5"
        >
          <select className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4" required>
            <option value="">Selectionner une raison</option>
            {reasons.map((reason) => (
              <option key={reason}>{reason}</option>
            ))}
          </select>
          <textarea
            required
            rows={7}
            placeholder="Description detaillee du probleme"
            className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3"
          />
          <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-5 text-center">
            <Upload className="text-[var(--brand-primary)]" size={30} />
            <span className="mt-2 text-[13px] font-semibold">Ajouter des preuves photos</span>
            <input type="file" multiple accept="image/*" className="sr-only" />
          </label>
          {submitted && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">
              Litige soumis. Le statut passe a "En cours d'examen" dans cette interface mock.
            </p>
          )}
          <button className="h-11 rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white">
            Soumettre le litige
          </button>
        </form>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="font-bold">Suivi</h2>
          <ol className="mt-4 space-y-3 text-[13px]">
            {["Soumis", "En cours d'examen", "Resolu"].map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className={`grid h-7 w-7 place-items-center rounded-full ${submitted && index <= 1 ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)]"}`}>
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-lg bg-[var(--brand-surface-alt)] p-4 text-[13px]">
            Messages moderation: aucune reponse pour le moment.
          </div>
          <Link to="/mes-commandes" className="mt-5 inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
            Retour commandes
          </Link>
        </aside>
      </section>
    </main>
  );
}
