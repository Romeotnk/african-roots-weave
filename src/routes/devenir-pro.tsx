import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { Camera, CheckCircle2, FileUp, MapPin, Plus, Stethoscope, Upload } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/devenir-pro")({
  head: () => ({ meta: [{ title: "Devenir professionnel - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute>
      <BecomePro />
    </ProtectedRoute>
  ),
});

const specialties = [
  "Gyneco-obstetrique",
  "Phytotherapie",
  "Dermatologie traditionnelle",
  "Osteo-articulaire",
  "Nutrition traditionnelle",
  "Ethnobotanique",
  "Sage-femme traditionnelle",
];

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const slots = ["Matin", "Apres-midi", "Soir"];

function BecomePro() {
  const [country, setCountry] = useState("BJ");
  const [online, setOnline] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(["Lundi-Matin", "Mercredi-Apres-midi"]);
  const [treated, setTreated] = useState(["Postpartum", "Digestion"]);
  const [treatedInput, setTreatedInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [formMessage, setFormMessage] = useState("");

  const completeness = useMemo(() => {
    const checks = [
      profileName.trim().length >= 3,
      bio.trim().length >= 300,
      city.trim().length >= 2,
      selectedSlots.length > 0,
      treated.length > 0,
      documents.length > 0,
      online !== undefined,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [bio, city, documents.length, online, profileName, selectedSlots.length, treated.length]);

  const toggleSlot = (value: string) => {
    setSelectedSlots((current) =>
      current.includes(value) ? current.filter((slot) => slot !== value) : [...current, value],
    );
  };

  const addTreated = () => {
    const value = treatedInput.trim();
    if (!value || treated.includes(value)) return;
    setTreated((current) => [...current, value].slice(0, 8));
    setTreatedInput("");
    setFormMessage("");
  };

  const submitProfile = () => {
    if (profileName.trim().length < 3) {
      setFormMessage("Renseignez le nom de pratique.");
      return;
    }
    if (bio.trim().length < 300) {
      setFormMessage("Le recit professionnel doit contenir au moins 300 caracteres.");
      return;
    }
    if (!city.trim()) {
      setFormMessage("Indiquez la ville du cabinet ou de pratique.");
      return;
    }
    if (selectedSlots.length === 0) {
      setFormMessage("Ajoutez au moins un creneau de disponibilite.");
      return;
    }
    if (treated.length === 0) {
      setFormMessage("Ajoutez au moins une specialite traitee.");
      return;
    }
    if (documents.length === 0) {
      setFormMessage("Ajoutez au moins un document ou certificat pour la moderation.");
      return;
    }

    setSubmitted(true);
    setFormMessage("Profil soumis en moderation. L'equipe verifiera les documents avant publication.");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">Annuaire professionnel</p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Creer mon profil professionnel</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            Completez votre profil, vos documents et vos disponibilites. La publication reste soumise a validation.
          </p>
        </div>
      </section>

      <section className="container-iwosan grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitProfile();
          }}
          className="space-y-6"
        >
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[20px] font-bold"><Stethoscope size={20} /> Informations identitaires</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <input required value={profileName} onChange={(event) => { setProfileName(event.target.value); setFormMessage(""); }} placeholder="Nom de pratique / nom d'exercice" className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
              <select className="h-11 rounded-lg border border-[var(--brand-border)] bg-white px-4">
                {specialties.map((item) => <option key={item}>{item}</option>)}
              </select>
              <input placeholder="Specialites secondaires (max 5)" className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
              <input placeholder="Langues pratiquees" className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)]">
                <Camera size={26} className="text-[var(--brand-primary)]" />
                <span className="mt-2 text-[13px] font-semibold">Photo de profil</span>
                <input type="file" accept="image/*" className="sr-only" />
              </label>
              <label className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)]">
                <Upload size={26} className="text-[var(--brand-primary)]" />
                <span className="mt-2 text-[13px] font-semibold">Galerie 5 a 10 photos</span>
                <input type="file" multiple accept="image/*" className="sr-only" />
              </label>
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[20px] font-bold">Recit professionnel</h2>
            <div className="mt-5 space-y-3">
              <textarea required minLength={300} value={bio} onChange={(event) => { setBio(event.target.value); setFormMessage(""); }} rows={6} placeholder="Histoire / biographie narrative, minimum 300 caracteres" className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
              <textarea rows={4} placeholder="Formation et initiation : comment, ou, avec qui" className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
              <div className="flex gap-2">
                <input value={treatedInput} onChange={(event) => setTreatedInput(event.target.value)} placeholder="Specialite traitee" className="h-10 flex-1 rounded-lg border border-[var(--brand-border)] px-3" />
                <button type="button" aria-label="Ajouter une specialite" onClick={addTreated} className="h-10 rounded-lg bg-[var(--brand-primary)] px-4 text-white"><Plus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {treated.map((item) => <button type="button" key={item} onClick={() => setTreated((current) => current.filter((value) => value !== item))} className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]">{item} x</button>)}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input type="number" min="0" max="100" placeholder="Taux de reussite auto-declare (%)" className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
                <input type="number" min="0" placeholder="Annees d'experience" className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
              </div>
              <textarea rows={3} placeholder="Explications obligatoires du taux annonce" className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3" />
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[20px] font-bold"><MapPin size={20} /> Localisation et disponibilite</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <CountrySelect value={country} onChange={setCountry} className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4" />
              <input value={city} onChange={(event) => { setCity(event.target.value); setFormMessage(""); }} placeholder="Ville" className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
              <input placeholder="Adresse du cabinet" className="h-11 rounded-lg border border-[var(--brand-border)] px-4 md:col-span-2" />
            </div>
            <div className="mt-4 rounded-[12px] border border-[var(--brand-border)] bg-[linear-gradient(135deg,#dff1e7,#f7efd4)] p-5">
              <div className="grid h-[190px] place-items-center rounded-lg bg-white/30 text-[13px] font-semibold text-[var(--brand-primary)]">
                Carte du cabinet a brancher
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <div className="grid min-w-[620px] grid-cols-[120px_repeat(3,1fr)] gap-2 text-[13px]">
                <div />
                {slots.map((slot) => <div key={slot} className="font-bold">{slot}</div>)}
                {days.map((day) => (
                  <Fragment key={day}>
                    <div className="font-semibold">{day}</div>
                    {slots.map((slot) => {
                      const value = `${day}-${slot}`;
                      return (
                        <button type="button" key={value} onClick={() => toggleSlot(value)} className={`rounded-lg border p-2 ${selectedSlots.includes(value) ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)]"}`}>
                          {selectedSlots.includes(value) ? "Disponible" : "Libre"}
                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
              <label className="flex flex-1 items-center justify-between rounded-lg border border-[var(--brand-border)] px-4 py-3 text-[13px] font-semibold">
                Consultations en ligne <Switch checked={online} onCheckedChange={setOnline} />
              </label>
              {online && <input placeholder="Lien visioconference" className="h-11 flex-1 rounded-lg border border-[var(--brand-border)] px-4" />}
              <input type="number" placeholder="Prix consultation" className="h-11 flex-1 rounded-lg border border-[var(--brand-border)] px-4" />
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[20px] font-bold">Documents et certifications</h2>
            <label className="mt-5 flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)]">
              <FileUp size={28} className="text-[var(--brand-primary)]" />
              <span className="mt-2 text-[13px] font-semibold">Documents envoyes a l'administration pour validation</span>
              <span className="mt-1 max-w-full px-4 text-center text-[11px] text-[var(--color-text-muted)]">{documents.length ? `${documents.length} fichier(s) selectionne(s)` : "Aucun fichier selectionne"}</span>
              <input type="file" multiple className="sr-only" onChange={(event) => { setDocuments(Array.from(event.target.files ?? []).map((file) => file.name)); setFormMessage(""); }} />
            </label>
          </div>

          {formMessage && <p className={`rounded-lg border p-3 text-[13px] ${submitted ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>{formMessage}</p>}
          <button type="submit" className="h-12 rounded-full bg-[var(--brand-primary)] px-7 font-semibold text-white">Soumettre mon profil</button>
        </form>

        <aside className="h-fit space-y-4">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="font-bold">Completion du profil</h2>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--brand-border-light)]">
              <div className="h-full bg-[var(--brand-primary)]" style={{ width: `${completeness}%` }} />
            </div>
            <p className="mt-2 text-[13px] font-semibold text-[var(--brand-primary)]">{completeness}% pret</p>
          </div>
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 text-[13px] text-[var(--color-text-secondary)]">
            <CheckCircle2 className="mb-3 text-[var(--brand-primary)]" /> Les certifications restent privees et servent a la validation du badge verifie.
          </div>
        </aside>
      </section>
    </main>
  );
}