import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Facebook, Instagram, Linkedin, Loader2, Mail, MapPin, Phone, Send, Ticket, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useSendContactMessage } from "@/hooks/useContactApi";
import { useCreateTicket, useUploadTicketAttachments } from "@/hooks/useTicketsApi";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact - IWOSAN" }] }),
  component: ContactPage,
});

const ticketCategories = [
  "Problème de paiement / portefeuille",
  "Compte & vérification (KYC)",
  "Commande / livraison",
  "Annonce ou profil professionnel",
  "Bug technique sur la plateforme",
  "Autre",
];

const priorities = ["Faible", "Moyenne", "Urgente"] as const;

// 5xx responses have their real message masked server-side (security
// precaution against leaking internals) — the API always returns the
// generic English string "Internal server error" for those, so surface a
// friendly French fallback instead of that raw text. 4xx validation
// messages are real and already in French, so those pass through as-is.
const friendlyErrorMessage = (error: unknown, fallback: string) => {
  if (!(error instanceof Error)) return fallback;
  if (error.message === "Internal server error") return fallback;
  return error.message;
};

function ContactPage() {
  const [tab, setTab] = useState<"message" | "ticket">("message");

  return (
    <main className="bg-[var(--brand-bg)]">
      <section className="container-iwosan py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <aside className="space-y-6 rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--brand-terracotta)]">NOS COORDONNÉES</p>
              <h1 className="mt-2 text-[34px]">Contact & Support</h1>
            </div>
            <div className="space-y-4 text-[14px] text-[var(--color-text-secondary)]">
              <p className="inline-flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand-primary)] text-white"><MapPin size={16} /></span> Immeuble Iwosan, Avenue Steinmetz, Quartier Ganhi, Cotonou, Bénin</p>
              <p className="inline-flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand-primary)] text-white"><Phone size={16} /></span> +229 21 30 45 67 (Lun–Ven 8h–18h)</p>
              <p className="inline-flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand-primary)] text-white"><Mail size={16} /></span> contact@iwosan.africa · support@iwosan.africa</p>
              <p className="inline-flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand-primary)] text-white"><Ticket size={16} /></span> Réponse sous 24h ouvrées</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--brand-border-light)]">
              <iframe title="OpenStreetMap" className="h-[230px] w-full" src="https://www.openstreetmap.org/export/embed.html?bbox=2.3712,6.3553,2.4112,6.3853&layer=mapnik&marker=6.3703,2.3912" style={{ filter: "sepia(12%) saturate(85%)" }} />
            </div>
            <div className="flex gap-2">
              {[Facebook, Instagram, Linkedin].map((Icon, index) => <a key={index} href="#" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--brand-surface-alt)]"><Icon size={16} /></a>)}
            </div>
          </aside>
          <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTab("message")} className={`rounded-full px-4 py-2 text-[13px] font-semibold ${tab === "message" ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--brand-border)]"}`}>Envoyer un message</button>
              <button onClick={() => setTab("ticket")} className={`rounded-full px-4 py-2 text-[13px] font-semibold ${tab === "ticket" ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--brand-border)]"}`}>Ouvrir un ticket de support</button>
            </div>

            {tab === "message" ? <MessageForm /> : <TicketForm />}
          </section>
        </div>
      </section>
    </main>
  );
}

function MessageForm() {
  const sendMessage = useSendContactMessage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.name.trim().length < 2) {
      setError("Indiquez votre nom.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Indiquez un email valide.");
      return;
    }
    if (form.subject.trim().length < 3) {
      setError("Indiquez un sujet.");
      return;
    }
    if (form.message.trim().length < 10) {
      setError("Votre message doit contenir au moins 10 caractères.");
      return;
    }

    sendMessage.mutate(
      { name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim(), message: form.message.trim() },
      {
        onSuccess: () => {
          setSuccess("Message envoyé — réponse sous 24h ouvrées.");
          setForm({ name: "", email: "", subject: "", message: "" });
        },
        onError: (mutationError) => setError(friendlyErrorMessage(mutationError, "Impossible d'envoyer le message pour le moment. Reessayez dans un instant.")),
      },
    );
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="h-12 rounded-full border border-[var(--brand-border)] px-4"
          placeholder="Nom complet"
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="h-12 rounded-full border border-[var(--brand-border)] px-4"
          placeholder="Email"
        />
      </div>
      <input
        value={form.subject}
        onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
        className="h-12 w-full rounded-full border border-[var(--brand-border)] px-4"
        placeholder="Sujet"
      />
      <textarea
        value={form.message}
        onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
        className="min-h-[130px] w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3"
        placeholder="Message"
      />
      {error && <p className="rounded-2xl bg-red-50 p-4 text-[14px] font-semibold text-red-700">{error}</p>}
      {success && <p className="rounded-2xl bg-[var(--brand-primary-subtle)] p-4 text-[14px] font-semibold text-[var(--brand-primary)]">{success}</p>}
      <button
        type="submit"
        disabled={sendMessage.isPending}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--brand-terracotta)] px-5 font-semibold text-white disabled:opacity-60"
      >
        {sendMessage.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {sendMessage.isPending ? "Envoi..." : "Envoyer le message"}
      </button>
    </form>
  );
}

function TicketForm() {
  const { user } = useAuth();
  const uploadAttachments = useUploadTicketAttachments();
  const createTicket = useCreateTicket();
  const [category, setCategory] = useState(ticketCategories[0]);
  const [orderNumber, setOrderNumber] = useState("");
  const [priority, setPriority] = useState<(typeof priorities)[number]>("Moyenne");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isPending = uploadAttachments.isPending || createTicket.isPending;

  if (!user) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-8 text-center">
        <Ticket className="mx-auto text-[var(--brand-primary)]" size={28} />
        <h2 className="mt-3 text-[18px] font-bold">Connexion requise</h2>
        <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
          L'ouverture d'un ticket de support nécessite un compte, afin de pouvoir suivre l'échange et vous répondre.
          Utilisez l'onglet « Envoyer un message » si vous préférez nous écrire sans vous connecter.
        </p>
        <Link to="/connexion" className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white">
          Se connecter
        </Link>
      </div>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (subject.trim().length < 3) {
      setError("Indiquez un sujet.");
      return;
    }
    if (description.trim().length < 10) {
      setError("La description doit contenir au moins 10 caractères.");
      return;
    }

    let attachments: string[] = [];
    try {
      if (file) {
        attachments = await uploadAttachments.mutateAsync([file]);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Impossible d'envoyer la pièce jointe.");
      return;
    }

    const contentParts = [
      `Priorité : ${priority}`,
      orderNumber.trim() ? `Commande : ${orderNumber.trim()}` : null,
      "",
      description.trim(),
    ].filter((part): part is string => part !== null);

    createTicket.mutate(
      { subject: subject.trim(), category, content: contentParts.join("\n"), attachments },
      {
        onSuccess: (response) => {
          const ticketId = (response.data as { id?: string } | null)?.id;
          setSuccess(ticketId ? `Ticket #${ticketId.slice(0, 8)} créé — suivi depuis « Mes tickets ».` : "Ticket créé — suivi depuis « Mes tickets ».");
          setSubject("");
          setOrderNumber("");
          setDescription("");
          setFile(null);
          setPriority("Moyenne");
        },
        onError: (mutationError) => setError(friendlyErrorMessage(mutationError, "Impossible de creer le ticket pour le moment. Reessayez dans un instant.")),
      },
    );
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <input
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        className="h-12 w-full rounded-full border border-[var(--brand-border)] px-4"
        placeholder="Sujet"
      />
      <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full rounded-full border border-[var(--brand-border)] px-4">
        {ticketCategories.map((item) => <option key={item}>{item}</option>)}
      </select>
      <input
        value={orderNumber}
        onChange={(event) => setOrderNumber(event.target.value)}
        className="h-12 w-full rounded-full border border-[var(--brand-border)] px-4"
        placeholder="Numéro commande optionnel (#CMD-4821)"
      />
      <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
        {priorities.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setPriority(item)}
            className={`rounded-full border px-4 py-2 ${priority === item ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : "border-[var(--brand-border)]"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="min-h-[120px] w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3"
        placeholder="Description"
      />
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] px-6 py-8 text-center text-[13px] text-[var(--color-text-muted)]">
        <Upload size={18} />
        {file ? file.name : "Glissez une capture d'écran ici ou cliquez pour parcourir"}
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </label>
      {error && <p className="rounded-2xl bg-red-50 p-4 text-[14px] font-semibold text-red-700">{error}</p>}
      {success && <p className="rounded-2xl bg-[var(--brand-primary-subtle)] p-4 text-[14px] font-semibold text-[var(--brand-primary)]">{success}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--brand-terracotta)] px-5 font-semibold text-white disabled:opacity-60"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {isPending ? (uploadAttachments.isPending ? "Envoi de la pièce jointe..." : "Création...") : "Ouvrir le ticket"}
      </button>
    </form>
  );
}
