import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CalendarDays, MapPin, MessageSquare, Video, X } from "lucide-react";
import { professionals } from "@/data/professionals";
import { RatingStars } from "@/components/shared/RatingStars";
import { PractitionerAvatar } from "@/components/shared/PractitionerAvatar";
import { useProfessional } from "@/hooks/useApiCatalog";

export const Route = createFileRoute("/annuaire/$id")({
  head: () => ({ meta: [{ title: "Profil praticien - IWOSAN" }] }),
  component: ProfessionalProfile,
});

const fallbackAvailability: Record<string, string[]> = {
  Lundi: ["09:00", "11:00"],
  Mercredi: ["14:00"],
  Samedi: ["10:00"],
};

function ProfessionalProfile() {
  const { id } = Route.useParams();
  const staticPro = professionals.find((item) => item.id === id);
  const { data: apiPro } = useProfessional(id, !staticPro);
  const pro = staticPro ?? apiPro ?? professionals[0];
  const [selectedDay, setSelectedDay] = useState(Object.keys(pro.availability ?? fallbackAvailability)[0]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [mode, setMode] = useState<"onsite" | "online">("onsite");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [messageFeedback, setMessageFeedback] = useState("");
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const availability: Record<string, string[]> = pro.availability ?? fallbackAvailability;
  const gallery = pro.gallery ?? [pro.cover, pro.avatar];
  const price = pro.consultationPrice ?? 15000;
  const slots = availability[selectedDay] ?? [];

  const dayItems = useMemo(() => Object.keys(availability), [availability]);

  useEffect(() => {
    if (!dayItems.includes(selectedDay)) {
      setSelectedDay(dayItems[0] ?? "");
      setSelectedSlot("");
    }
  }, [dayItems, selectedDay]);

  useEffect(() => {
    if (galleryIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGalleryIndex(null);
      if (event.key === "ArrowLeft") setGalleryIndex((value) => (value === null ? value : (value - 1 + gallery.length) % gallery.length));
      if (event.key === "ArrowRight") setGalleryIndex((value) => (value === null ? value : (value + 1) % gallery.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [gallery.length, galleryIndex]);

  const requestBooking = () => {
    setMessageFeedback("");
    if (!selectedSlot) {
      setFeedback("Choisissez un creneau avant de demander le rendez-vous.");
      return;
    }
    if (reason.trim().length < 10) {
      setFeedback("Precisez le motif de consultation en quelques mots.");
      return;
    }
    setFeedback(`Demande envoyee pour ${selectedDay} a ${selectedSlot}. Le praticien devra confirmer le rendez-vous.`);
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="relative min-h-[360px] bg-[var(--brand-primary-dark)] text-white">
        <img src={pro.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="relative container-iwosan py-16">
          <PractitionerAvatar src={pro.avatar} name={pro.name} isVerified={pro.verified} size="lg" clickable gallery={[pro.avatar, ...gallery]} />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-[34px] md:text-[48px] text-white">{pro.name}</h1>
            {pro.verified && <BadgeCheck className="text-[var(--brand-gold)]" size={28} />}
          </div>
          <p className="mt-2 text-white/80">{pro.specialty}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-white/75"><MapPin size={16} /> {pro.location}, {pro.country}</p>
          <div className="mt-4"><RatingStars rating={pro.rating} reviewCount={pro.reviewCount} /></div>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <h2 className="text-[22px] font-bold">Recit professionnel</h2>
            <p className="mt-3 leading-7 text-[var(--color-text-secondary)]">{pro.bio}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-[var(--brand-surface-alt)] p-4"><strong>{pro.yearsExperience ?? 15} ans</strong><p className="text-[12px] text-[var(--color-text-muted)]">Experience</p></div>
              <div className="rounded-lg bg-[var(--brand-surface-alt)] p-4"><strong>{price.toLocaleString("fr-FR")} FCFA</strong><p className="text-[12px] text-[var(--color-text-muted)]">Consultation</p></div>
              <div className="rounded-lg bg-[var(--brand-surface-alt)] p-4"><strong>{pro.online ? "Oui" : "Sur demande"}</strong><p className="text-[12px] text-[var(--color-text-muted)]">En ligne</p></div>
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <h2 className="text-[22px] font-bold">Specialites traitees</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {pro.specialties.map((item) => <span key={item} className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[13px] font-semibold text-[var(--brand-primary)]">{item}</span>)}
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <h2 className="text-[22px] font-bold">Galerie</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((image, index) => (
                <button key={`${image}-${index}`} type="button" onClick={() => setGalleryIndex(index)} className="aspect-[4/3] overflow-hidden rounded-lg">
                  <img src={image} alt="" className="h-full w-full object-cover transition hover:scale-105" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="flex items-center gap-2 text-[20px] font-bold"><CalendarDays size={20} /> Prendre rendez-vous</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {dayItems.map((day) => (
              <button key={day} type="button" onClick={() => { setSelectedDay(day); setSelectedSlot(""); setFeedback(""); }} className={`rounded-full px-3 py-1 text-[12px] font-semibold ${selectedDay === day ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)]"}`}>
                {day}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {slots.length > 0 ? slots.map((slot) => (
              <button key={slot} type="button" onClick={() => { setSelectedSlot(slot); setFeedback(""); }} className={`rounded-lg border p-3 text-[13px] font-semibold ${selectedSlot === slot ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)]"}`}>
                {slot}
              </button>
            )) : (
              <p className="col-span-2 rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px] text-[var(--color-text-muted)]">Aucun creneau disponible ce jour.</p>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMode("onsite")} className={`rounded-lg border p-3 text-[13px] font-semibold ${mode === "onsite" ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border)]"}`}>Presentiel</button>
            <button type="button" onClick={() => setMode("online")} className={`rounded-lg border p-3 text-[13px] font-semibold ${mode === "online" ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border)]"}`}><Video size={14} className="inline" /> En ligne</button>
          </div>
          <textarea value={reason} onChange={(event) => { setReason(event.target.value); setFeedback(""); }} rows={4} placeholder="Motif de consultation" className="mt-4 w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
          <div className="mt-4 rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">
            {selectedDay} {selectedSlot || "creneau a choisir"} - {mode === "online" ? "En ligne" : "Presentiel"} - {price.toLocaleString("fr-FR")} FCFA
          </div>
          {feedback && <p className={`mt-3 rounded-lg p-3 text-[13px] ${feedback.startsWith("Demande") ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{feedback}</p>}
          {messageFeedback && <p className="mt-3 rounded-lg bg-[var(--brand-primary-subtle)] p-3 text-[13px] text-[var(--brand-primary)]">{messageFeedback}</p>}
          <button type="button" onClick={requestBooking} className="mt-4 h-11 w-full rounded-full bg-[var(--brand-primary)] font-semibold text-white">
            Demander le rendez-vous
          </button>
          <button type="button" onClick={() => { setFeedback(""); setMessageFeedback(`Message pret a etre envoye a ${pro.name}. La messagerie sera branchee a l'API.`); }} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] text-[13px] font-semibold">
            <MessageSquare size={15} /> Envoyer un message
          </button>
        </aside>
      </section>

      {galleryIndex !== null && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setGalleryIndex(null)}
            aria-label="Fermer la galerie"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <button
            type="button"
            onClick={() => setGalleryIndex((galleryIndex - 1 + gallery.length) % gallery.length)}
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-[24px] font-bold text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Image precedente"
          >
            ‹
          </button>
          <img src={gallery[galleryIndex]} alt="" className="max-h-[82vh] w-full max-w-[500px] rounded-[12px] object-contain shadow-2xl animate-in zoom-in-95 duration-200" />
          <button
            type="button"
            onClick={() => setGalleryIndex((galleryIndex + 1) % gallery.length)}
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-[24px] font-bold text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Image suivante"
          >
            ›
          </button>
        </div>
      )}
    </main>
  );
}