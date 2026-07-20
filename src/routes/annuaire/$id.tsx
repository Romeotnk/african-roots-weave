import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, Facebook, Instagram, Linkedin, MapPin, Smartphone } from "lucide-react";
import { professionals } from "@/data/professionals";
import { products } from "@/data/products";
import { events } from "@/data/events";
import { trainings } from "@/data/trainings";
import { RatingStars } from "@/components/shared/RatingStars";
import { PractitionerAvatar } from "@/components/shared/PractitionerAvatar";
import { ProductCard } from "@/components/shared/ProductCard";
import { EventCard } from "@/components/shared/EventCard";

export const Route = createFileRoute("/annuaire/$id")({
  head: () => ({ meta: [{ title: "Profil praticien - IWOSAN" }] }),
  component: ProfessionalProfile,
});

function ProfessionalProfile() {
  const { id } = Route.useParams();
  const pro = professionals.find((item) => item.id === id) ?? professionals[0];
  const featuredProducts = products.filter((product) => product.sellerId === pro.id);
  const proTrainings = trainings.filter((course) => course.instructorProfileId === pro.id);
  const futureEvents = events.filter((event) => new Date(event.date).getTime() >= Date.now());
  const [tab, setTab] = useState<"about" | "location" | "products" | "training" | "events">("about");
  const [messageState, setMessageState] = useState("");
  const [messageSeen, setMessageSeen] = useState(false);

  const stats = useMemo(() => [
    [pro.yearsExperience ?? 15, "ans d'expérience"],
    [420, "patients suivis"],
    [96, "% taux de réussite"],
  ], [pro.yearsExperience]);

  const socialLinks = [
    { label: "WhatsApp", href: `https://wa.me/22900000000?text=${encodeURIComponent(`Bonjour ${pro.name}`)}`, icon: Smartphone },
    { label: "Facebook", href: "https://facebook.com", icon: Facebook },
    { label: "Instagram", href: "https://instagram.com", icon: Instagram },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  ];

  return (
    <main className="bg-[var(--brand-bg)]">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#1f5a39_0%,#2d7a4f_100%)] text-white">
        <div className="absolute inset-0">
          <img src={pro.cover} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(30,42,79,.45),rgba(30,42,79,.92))]" />
        </div>
        <div className="relative container-iwosan py-16 md:py-20">
          <div className="max-w-4xl">
            <span className="font-mono text-[12px] tracking-[0.22em] text-[var(--brand-gold)]">PROFIL PROFESSIONNEL</span>
            <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-5 md:flex-row md:items-end">
                <PractitionerAvatar src={pro.avatar} name={pro.name} isVerified={pro.verified} size="lg" clickable gallery={[pro.avatar, pro.cover]} />
                <div>
                  <h1 className="text-[38px] text-white md:text-[60px]">{pro.name}</h1>
                  <p className="mt-2 max-w-2xl text-white/80">{pro.specialty}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-white/75"><MapPin size={16} /> {pro.location}, {pro.country}</p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white"><BadgeCheck size={14} className="text-[var(--brand-gold)]" /> Vérifié</div>
                </div>
              </div>
              <RatingStars rating={pro.rating} reviewCount={pro.reviewCount} size="md" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <nav className="flex flex-wrap gap-2">
              {[["about", "À propos"], ["location", "Localisation"], ["products", `Ses produits & services (${featuredProducts.length})`], ["training", "Ses formations"], ["events", "Prochains événements"]].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key as any)} className={`rounded-full px-4 py-2 text-[13px] font-semibold ${tab === key ? "bg-[var(--brand-primary)] text-white" : "bg-white border border-[var(--brand-border)]"}`}>{label}</button>
              ))}
            </nav>

            {tab === "about" && (
              <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">À PROPOS</p>
                <p className="mt-4 text-[16px] leading-8 text-[var(--color-text-secondary)]">{pro.bio} Le praticien est présenté ici comme un mini-site premium pour faciliter la découverte, la confiance et la prise de contact responsable.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {stats.map(([value, label]) => (
                    <div key={label as string} className="rounded-2xl bg-[var(--brand-surface-alt)] p-5 text-center">
                      <div className="text-[32px] font-bold text-[var(--brand-primary)]">{value}</div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "location" && (
              <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">LOCALISATION</p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--brand-border-light)]">
                  <iframe title="Google Maps" className="h-[280px] w-full" src="https://maps.google.com/maps?q=6.3703,2.3912&output=embed" style={{ filter: "sepia(12%) saturate(85%)" }} />
                </div>
                <p className="mt-4 text-[14px] text-[var(--color-text-secondary)]">Immeuble Iwosan, Avenue Steinmetz, Quartier Ganhi, Cotonou, Bénin</p>
              </section>
            )}

            {tab === "products" && (
              <section className="space-y-5">
                <div className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                  <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">SES PRODUITS & SERVICES</p>
                  <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                  </div>
                </div>
              </section>
            )}

            {tab === "training" && (
              <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">FORMATIONS</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {proTrainings.length > 0 ? proTrainings.map((course) => (
                    <article key={course.id} className="overflow-hidden rounded-2xl border border-[var(--brand-border-light)]">
                      <div className="h-40 bg-[var(--brand-surface-alt)]">
                        <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-4">
                        <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[11px] font-bold text-[var(--brand-primary)]">{course.price === 0 ? "GRATUIT" : "PAYANT"}</span>
                        <h3 className="mt-3 text-[20px] font-bold">{course.title}</h3>
                        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{course.format} · {course.duration}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link to="/formations/$id" params={{ id: course.id }} className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[13px] font-semibold text-white">Accéder</Link>
                          <Link to="/pro/$id" params={{ id: pro.id }} className="rounded-full border border-[var(--brand-border)] px-4 py-2 text-[13px] font-semibold">Profil pro</Link>
                        </div>
                      </div>
                    </article>
                  )) : [1, 2].map((i) => (
                    <article key={i} className="overflow-hidden rounded-2xl border border-[var(--brand-border-light)]">
                      <div className="h-40 bg-[var(--brand-surface-alt)]" />
                      <div className="p-4">
                        <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[11px] font-bold text-[var(--brand-primary)]">GRATUIT</span>
                        <h3 className="mt-3 text-[20px] font-bold">Formation pratique {i}</h3>
                        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">Vidéo · 45 min</p>
                        <Link to="/formations/tr1" className="mt-4 inline-flex rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[13px] font-semibold text-white">Accéder</Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {tab === "events" && (
              <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">ÉVÉNEMENTS À VENIR</p>
                <div className="mt-4 space-y-4">
                  {futureEvents.slice(0, 3).map((event) => <EventCard key={event.id} event={event} actionLabel="S'inscrire" />)}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 h-fit space-y-5 rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--brand-terracotta)]">CONTACT RAPIDE</p>
              <h2 className="mt-2 text-[26px]">Contacter {pro.name.split(" ")[0]}</h2>
            </div>
            <div className="space-y-3">
              <a className="block rounded-full bg-[#25D366] px-4 py-3 text-center font-semibold text-white" href={`https://wa.me/22900000000?text=${encodeURIComponent(`Bonjour ${pro.name}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
              <Link className="block rounded-full bg-[linear-gradient(135deg,#1f5a39_0%,#2d7a4f_100%)] px-4 py-3 text-center font-semibold text-white" to="/messages">Messagerie interne</Link>
              <a className="block rounded-full bg-[var(--brand-terracotta)] px-4 py-3 text-center font-semibold text-white" href={`https://wa.me/22900000000?text=${encodeURIComponent(`Bonjour, je voudrais réserver un service chez ${pro.name}`)}`} target="_blank" rel="noreferrer">Réserver un service</a>
            </div>
            <div className="border-t border-[var(--brand-border-light)] pt-4 text-[13px] text-[var(--color-text-secondary)]">
              <p><strong>Disponibilité :</strong> Sur rendez-vous</p>
              <p className="mt-2"><strong>Langues :</strong> Français, Fon, Yoruba</p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-surface-alt)]" aria-label={label}><Icon size={16} /></a>
              ))}
            </div>
            {(messageState && !messageSeen) && (
              <div className="rounded-2xl bg-[var(--brand-primary-subtle)] p-4 text-[13px] text-[var(--brand-primary)]">Message pré-rempli: {messageState}<div className="mt-3 flex gap-2"><Link to="/messages" className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[12px] font-semibold text-white">Ouvrir la messagerie</Link><button type="button" onClick={() => setMessageSeen(true)} className="rounded-full border border-[var(--brand-primary)] px-4 py-2 text-[12px] font-semibold text-[var(--brand-primary)]">Fermer</button></div></div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
