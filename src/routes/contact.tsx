import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Send, Ticket, Upload } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact - IWOSAN" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [tab, setTab] = useState<"message" | "ticket">("message");
  const [status, setStatus] = useState("");

  const submit = (label: string) => {
    setStatus(label);
  };

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

            {tab === "message" ? (
              <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); submit("Message envoyé — réponse sous 24h ouvrées"); }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="h-12 rounded-full border border-[var(--brand-border)] px-4" placeholder="Nom complet" />
                  <input className="h-12 rounded-full border border-[var(--brand-border)] px-4" placeholder="Email" />
                </div>
                <input className="h-12 w-full rounded-full border border-[var(--brand-border)] px-4" placeholder="Sujet" />
                <textarea className="min-h-[130px] w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3" placeholder="Message" />
                <button className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--brand-terracotta)] px-5 font-semibold text-white"><Send size={16} /> Envoyer le message</button>
              </form>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); submit("Ticket #TCK-4821 créé — suivi par e-mail"); }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="h-12 rounded-full border border-[var(--brand-border)] px-4" placeholder="Nom complet" />
                  <input className="h-12 rounded-full border border-[var(--brand-border)] px-4" placeholder="Email" />
                </div>
                <select className="h-12 w-full rounded-full border border-[var(--brand-border)] px-4">
                  <option>Problème de paiement / portefeuille</option>
                  <option>Compte & vérification (KYC)</option>
                  <option>Commande / livraison</option>
                  <option>Annonce ou profil professionnel</option>
                  <option>Bug technique sur la plateforme</option>
                  <option>Autre</option>
                </select>
                <input className="h-12 w-full rounded-full border border-[var(--brand-border)] px-4" placeholder="Numéro commande optionnel (#CMD-4821)" />
                <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
                  {["Faible", "Moyenne", "Urgente"].map((item) => <button type="button" key={item} className="rounded-full border border-[var(--brand-border)] px-4 py-2">{item}</button>)}
                </div>
                <textarea className="min-h-[120px] w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3" placeholder="Description" />
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] px-6 py-8 text-center text-[13px] text-[var(--color-text-muted)]">
                  <Upload size={18} />
                  Glissez une capture d'écran ici ou cliquez pour parcourir
                  <input type="file" className="hidden" />
                </label>
                <button className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--brand-terracotta)] px-5 font-semibold text-white">Ouvrir le ticket</button>
              </form>
            )}
            {status && <p className="mt-5 rounded-2xl bg-[var(--brand-primary-subtle)] p-4 text-[14px] font-semibold text-[var(--brand-primary)]">{status}</p>}
          </section>
        </div>
      </section>
    </main>
  );
}


