import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/mes-commandes/$id/litige")({
  head: () => ({ meta: [{ title: "Litige - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["user", "researcher", "professional", "admin", "super_admin"]}>
      <DisputePage />
    </ProtectedRoute>
  ),
});

const reasons = [
  "Produit non reçu",
  "Produit différent de l'annonce",
  "Produit endommagé",
  "Service non réalisé",
  "Autre problème",
];

function DisputePage() {
  const { id } = Route.useParams();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const submitDispute = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanDescription = description.trim();

    if (!reason) {
      setFormMessage("Sélectionnez une raison pour ouvrir le litige.");
      return;
    }

    if (cleanDescription.length < 25) {
      setFormMessage("Ajoutez une description plus précise, au moins 25 caracteres.");
      return;
    }

    setSubmitted(true);
    setFormMessage("Litige soumis. Le statut passe à En cours d'examen.");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
            Commande {id}
          </p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Ouvrir un litige</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            Décrivez clairement le problème pour accélérer la médiation entre acheteur, vendeur et support IWOSAN.
          </p>
        </div>
      </section>

      <section className="container-iwosan grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={submitDispute} className="space-y-5 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <div>
            <label className="text-[13px] font-semibold" htmlFor="dispute-reason">Raison du litige</label>
            <select
              id="dispute-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setSubmitted(false);
              }}
              className="mt-2 h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4"
            >
              <option value="">Selectionner une raison</option>
              {reasons.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-semibold" htmlFor="dispute-description">Description détaillée</label>
            <textarea
              id="dispute-description"
              rows={7}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setSubmitted(false);
              }}
              placeholder="Expliquez ce qui s'est passé, les dates, les échanges et ce que vous attendez comme résolution."
              className="mt-2 w-full rounded-lg border border-[var(--brand-border)] px-4 py-3"
            />
            <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">{description.trim().length}/25 caractères minimum</p>
          </div>

          <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-5 text-center">
            <Upload className="text-[var(--brand-primary)]" size={30} />
            <span className="mt-2 text-[13px] font-semibold">Ajouter des preuves photos</span>
            <span className="mt-1 text-[12px] text-[var(--color-text-muted)]">
              {evidenceCount > 0 ? `${evidenceCount} fichier${evidenceCount > 1 ? "s" : ""} selectionne${evidenceCount > 1 ? "s" : ""}` : "Formats images uniquement"}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(event) => setEvidenceCount(event.target.files?.length ?? 0)}
            />
          </label>

          {formMessage && (
            <p className={`rounded-lg border p-3 text-[13px] ${submitted ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
              {formMessage}
            </p>
          )}

          <button type="submit" className="h-11 rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white">
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
            {submitted ? "Moderation: votre dossier est en cours d'examen." : "Moderation: aucun litige soumis pour le moment."}
          </div>
          <Link to="/mes-commandes" className="mt-5 inline-flex h-10 items-center rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
            Retour commandes
          </Link>
        </aside>
      </section>
    </main>
  );
}