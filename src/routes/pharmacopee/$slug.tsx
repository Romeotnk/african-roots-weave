import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bug, Lightbulb, X } from "lucide-react";
import { plants } from "@/data/plants";
import { useMonograph } from "@/hooks/useContentApi";
import { mapMonographToPlant } from "@/lib/mappers/plantMonograph";

export const Route = createFileRoute("/pharmacopee/$slug")({
  head: () => ({ meta: [{ title: "Monographie plante - IWOSAN" }] }),
  component: PlantMonograph,
});

function PlantMonograph() {
  const { slug } = Route.useParams();
  const staticPlant = plants.find((item) => item.slug === slug);
  const { data: monograph } = useMonograph(slug, !staticPlant);
  const apiPlant = useMemo(() => mapMonographToPlant(monograph), [monograph]);
  const plant = staticPlant ?? apiPlant ?? plants[0];
  const gallery = useMemo(() => plant.gallery ?? [plant.image], [plant.gallery, plant.image]);
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [feedback, setFeedback] = useState<"error" | "improve" | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    setActiveImage(gallery[0]);
  }, [gallery]);

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="bg-[var(--brand-primary-dark)] text-white">
        <div className="container-iwosan grid gap-8 py-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-gold)]">Pharmacopée vivante</p>
            <h1 className="mt-3 text-[38px] italic text-white md:text-[56px]">{plant.scientificName}</h1>
            <p className="mt-3 text-white/75">{plant.vernacularNames.join(" · ")}</p>
            <p className="mt-5 max-w-2xl text-white/80">{plant.summary}</p>
          </div>
          <div>
            <img src={activeImage} alt={plant.scientificName} className="aspect-[4/3] w-full rounded-[12px] object-cover" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {gallery.map((image) => (
                <button key={image} onClick={() => setActiveImage(image)} className="aspect-[4/3] overflow-hidden rounded-lg border border-white/20">
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <h2 className="text-[22px] font-bold">Identification</h2>
            <dl className="mt-4 grid gap-3 md:grid-cols-2">
              <div><dt className="text-[12px] font-bold uppercase text-[var(--color-text-muted)]">Noms locaux</dt><dd>{plant.vernacularNames.join(", ")}</dd></div>
              <div><dt className="text-[12px] font-bold uppercase text-[var(--color-text-muted)]">Famille</dt><dd>{plant.family}</dd></div>
              <div><dt className="text-[12px] font-bold uppercase text-[var(--color-text-muted)]">Distribution</dt><dd>{plant.region ?? plant.origin}</dd></div>
              <div><dt className="text-[12px] font-bold uppercase text-[var(--color-text-muted)]">Catégorie</dt><dd>{plant.therapeuticCategory}</dd></div>
            </dl>
            <p className="mt-4 leading-7 text-[var(--color-text-secondary)]">{plant.botanicalDescription}</p>
          </section>

          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <h2 className="text-[22px] font-bold">Propriétés médicinales</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-[var(--brand-border)]">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[var(--brand-surface-alt)]">
                  <tr><th className="p-3">Propriété</th><th className="p-3">Usage</th><th className="p-3">Niveau</th></tr>
                </thead>
                <tbody>
                  {(plant.medicinalProperties ?? []).map((item) => (
                    <tr key={item.property} className="border-t border-[var(--brand-border)]">
                      <td className="p-3 font-semibold">{item.property}</td>
                      <td className="p-3">{item.use}</td>
                      <td className="p-3">{item.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <h2 className="text-[22px] font-bold">Préparations traditionnelles</h2>
            <ol className="mt-4 space-y-3">
              {(plant.preparations ?? []).map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-[12px] font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[12px] border border-red-200 bg-red-50 p-6 text-red-900">
            <h2 className="flex items-center gap-2 text-[20px] font-bold">
              <AlertTriangle size={20} /> Précautions et contre-indications
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[14px]">
              {(plant.precautions ?? []).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <h2 className="text-[22px] font-bold">Références</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[14px] text-[var(--color-text-secondary)]">
              {(plant.references ?? []).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <button type="button" onClick={() => { setFeedback("error"); setFeedbackMessage(""); setFeedbackSent(false); }} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] text-[13px] font-semibold">
            <Bug size={15} /> Signaler une erreur
          </button>
          <button type="button" onClick={() => { setFeedback("improve"); setFeedbackMessage(""); setFeedbackSent(false); }} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] text-[13px] font-semibold text-white">
            <Lightbulb size={15} /> Suggérer une amélioration
          </button>
          {feedback && (
            <div className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">{feedback === "error" ? "Erreur signalée" : "Amélioration proposée"}</p>
                <button type="button" onClick={() => { setFeedback(null); setFeedbackMessage(""); setFeedbackSent(false); }} aria-label="Fermer le formulaire"><X size={15} /></button>
              </div>
              <textarea rows={4} value={feedbackMessage} onChange={(event) => { setFeedbackMessage(event.target.value); setFeedbackSent(false); }} placeholder="Votre message..." className="mt-3 w-full rounded-lg border border-[var(--brand-border)] px-3 py-2 text-[13px]" />
              <button type="button" onClick={() => setFeedbackSent(true)} disabled={feedbackMessage.trim().length < 10} className="mt-3 h-9 rounded-full bg-[var(--brand-primary)] px-4 text-[12px] font-semibold text-white disabled:opacity-50">
                Envoyer la contribution
              </button>
              {feedbackSent && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[12px] text-emerald-800">Contribution enregistrée. Elle sera examinée par notre équipe éditoriale.</p>}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
