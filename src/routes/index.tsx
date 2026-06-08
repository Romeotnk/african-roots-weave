import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Leaf, Stethoscope, FlaskConical, ChefHat, MessagesSquare, GraduationCap, MapPin, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProfessionalCard } from "@/components/shared/ProfessionalCard";
import { PlantCard } from "@/components/shared/PlantCard";
import { EventCard } from "@/components/shared/EventCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { RatingStars } from "@/components/shared/RatingStars";
import { professionals } from "@/data/professionals";
import { products } from "@/data/products";
import { plants } from "@/data/plants";
import { events } from "@/data/events";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IWOSAN — Le patrimoine médical africain, documenté et accessible" },
      { name: "description", content: "Plateforme panafricaine connectant praticiens traditionnels, chercheurs et communautés autour d'un savoir endogène rigoureusement documenté." },
      { property: "og:title", content: "IWOSAN — Plateforme panafricaine de médecine traditionnelle" },
      { property: "og:description", content: "500+ praticiens vérifiés, 1 200+ plantes documentées, dans 20+ pays africains." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=80" },
    ],
  }),
  component: Home,
});

const spaces = [
  { name: "Pharmacopée vivante", desc: "Monographies scientifiques des plantes médicinales africaines.", count: "1 200+ plantes", icon: Leaf, color: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]", to: "/pharmacopee" },
  { name: "Rites & Cultures", desc: "Cérémonies, symboliques végétales et transmission ancestrale.", count: "180 articles", icon: FlaskConical, color: "bg-purple-50 text-purple-700", to: "/rites-cultures" },
  { name: "Santé au quotidien", desc: "Conseils, prévention et bien-être issus des savoirs africains.", count: "320 articles", icon: Stethoscope, color: "bg-teal-50 text-teal-700", to: "/sante-quotidien" },
  { name: "Recettes santé", desc: "Préparations traditionnelles documentées pas à pas.", count: "240 recettes", icon: ChefHat, color: "bg-orange-50 text-orange-700", to: "/recettes-sante" },
  { name: "Discutons-en", desc: "Forum Q&A entre praticiens, chercheurs et communauté.", count: "5 400+ questions", icon: MessagesSquare, color: "bg-blue-50 text-blue-700", to: "/discutons-en" },
  { name: "Formations", desc: "Cours en ligne, webinaires et certifications encadrés.", count: "90 formations", icon: GraduationCap, color: "bg-amber-50 text-amber-700", to: "/formations" },
];

function Home() {
  const featured = professionals[0];
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,61,26,0.92) 0%, rgba(26,92,42,0.75) 100%)" }} />
        </div>
        <div className="relative container-iwosan py-24 text-white text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1.5 text-[12px] font-semibold backdrop-blur-sm">
              🌿 Plateforme panafricaine
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="mt-6 text-[40px] md:text-[56px] text-white max-w-4xl mx-auto leading-[1.05]">
            Le patrimoine médical africain, enfin documenté et accessible
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-6 text-[16px] md:text-[18px] text-white/80 max-w-2xl mx-auto leading-[1.7]">
            Iwosan connecte praticiens traditionnels, chercheurs et communautés autour d'un savoir endogène rigoureusement documenté.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/marketplace" className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[var(--brand-gold)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--brand-gold-light)] transition shadow-iwosan-md">
              Explorer la plateforme <ArrowRight size={18} />
            </Link>
            <Link to="/inscription" className="inline-flex items-center gap-2 h-12 px-7 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-[var(--brand-primary)] transition">
              Rejoindre la communauté
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }} className="mt-10 flex items-center justify-center gap-3 md:gap-5 text-[13px] md:text-[14px] text-white/60 flex-wrap">
            <span><strong className="text-white">500+</strong> Praticiens</span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span><strong className="text-white">1 200+</strong> Plantes</span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span><strong className="text-white">20+</strong> Pays</span>
          </motion.div>
        </div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60">
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* PORTRAIT DE LA SEMAINE */}
      <section className="py-20 md:py-28 bg-[var(--brand-surface-alt)]">
        <div className="container-iwosan">
          <SectionHeader label="Mise en lumière" title="Portrait de la semaine" />
          <div className="bg-white rounded-[20px] overflow-hidden shadow-iwosan-md grid md:grid-cols-[40%_60%]">
            <div className="h-[280px] md:h-auto"><img src={featured.cover} alt="" className="w-full h-full object-cover" /></div>
            <div className="p-7 md:p-10">
              <span className="inline-flex items-center gap-1.5 bg-[var(--brand-gold)] text-white text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full">⭐ Praticien de la semaine</span>
              <h3 className="mt-4 text-[28px] md:text-[32px] text-[var(--brand-primary)] font-bold">{featured.name}</h3>
              <p className="mt-1 text-[15px] text-[var(--color-text-secondary)]">{featured.specialty}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-[var(--color-text-muted)]"><MapPin size={14} /> {featured.location}, {featured.country}</p>
              <p className="mt-5 text-[15px] leading-[1.7] text-[var(--color-text-secondary)]">{featured.bio}</p>
              <ul className="mt-5 space-y-2">
                {featured.specialties.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-[14px]"><CheckCircle2 size={16} className="text-[var(--brand-gold)]" /> {s}</li>
                ))}
              </ul>
              <div className="mt-5"><RatingStars rating={featured.rating} reviewCount={featured.reviewCount} size="md" /></div>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <button className="h-11 px-5 rounded-full bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-dark)] transition">Voir le profil complet</button>
                <button className="h-11 px-5 rounded-full border border-[var(--brand-border)] font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition">Prendre rendez-vous</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOS ESPACES */}
      <section className="py-20 md:py-28">
        <div className="container-iwosan">
          <SectionHeader label="Découvrir" title="Six espaces de savoir" subtitle="Une plateforme structurée, rigoureuse, qui met le savoir endogène au même niveau d'exigence que la science moderne." align="center" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((s) => (
              <Link key={s.name} to={s.to} className="group bg-white border border-[var(--brand-border-light)] rounded-[16px] p-7 card-hover">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${s.color} group-hover:scale-110 transition-transform`}>
                  <s.icon size={22} />
                </div>
                <h3 className="text-[20px] font-bold mb-2">{s.name}</h3>
                <p className="text-[14px] text-[var(--color-text-secondary)] leading-[1.6] mb-4">{s.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[var(--brand-border-light)]">
                  <span className="text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{s.count}</span>
                  <span className="inline-flex items-center gap-1 text-[var(--brand-primary)] font-semibold text-[13px]">Explorer <ArrowRight size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="py-20 md:py-28 bg-[var(--brand-surface-alt)]">
        <div className="container-iwosan">
          <SectionHeader label="Marketplace" title="Produits & services en vedette" action={<Link to="/marketplace" className="text-[14px] font-semibold text-[var(--brand-primary)] inline-flex items-center gap-1">Voir tout le marketplace <ArrowRight size={14} /></Link>} />
          <div className="flex gap-2 mb-8 flex-wrap">
            {["Tous", "Produits", "Services", "Numériques"].map((t, i) => (
              <button key={t} className={`px-4 py-2 rounded-full text-[13px] font-semibold transition ${i === 0 ? "bg-[var(--brand-primary)] text-white" : "bg-white border border-[var(--brand-border)] text-[var(--color-text-secondary)] hover:border-[var(--brand-primary)]"}`}>{t}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-10 text-center">
            <Link to="/marketplace" className="inline-flex items-center gap-2 h-12 px-7 rounded-full border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold hover:bg-[var(--brand-primary)] hover:text-white transition">Voir les 500+ produits</Link>
          </div>
        </div>
      </section>

      {/* PRATICIENS VÉRIFIÉS */}
      <section className="py-20 md:py-28">
        <div className="container-iwosan">
          <SectionHeader label="Confiance & Expertise" title="Praticiens vérifiés" subtitle="Chaque praticien est documenté, évalué et vérifié par notre équipe éditoriale." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {professionals.slice(0, 4).map((p) => <ProfessionalCard key={p.id} pro={p} />)}
          </div>
          <div className="mt-10 text-center">
            <Link to="/annuaire" className="inline-flex items-center gap-2 h-12 px-7 rounded-full border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold hover:bg-[var(--brand-primary)] hover:text-white transition">Voir l'annuaire complet</Link>
          </div>
        </div>
      </section>

      {/* PHARMACOPÉE — dark section */}
      <section className="py-20 md:py-28 bg-[var(--brand-primary-dark)]">
        <div className="container-iwosan">
          <SectionHeader label="Pharmacopée vivante" title="Plantes médicinales documentées" subtitle="Nomenclature scientifique, principes actifs, indications thérapeutiques et préparations illustrées." invert />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plants.slice(0, 3).map((p) => <PlantCard key={p.id} plant={p} dark />)}
          </div>
          <div className="mt-10 text-center">
            <Link to="/pharmacopee" className="inline-flex items-center gap-2 h-12 px-7 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-[var(--brand-primary-dark)] transition">Explorer la pharmacopée</Link>
          </div>
        </div>
      </section>

      {/* AGENDA */}
      <section className="py-20 md:py-28">
        <div className="container-iwosan">
          <SectionHeader label="Agenda" title="Prochains événements" action={<Link to="/agenda" className="text-[14px] font-semibold text-[var(--brand-primary)]">Voir tout →</Link>} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section className="py-16 bg-[var(--brand-surface-alt)] border-y border-[var(--brand-border-light)]">
        <div className="container-iwosan">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 md:divide-x divide-[var(--brand-border)]">
            {[
              { v: 500, s: "+", l: "Praticiens documentés" },
              { v: 1200, s: "+", l: "Plantes médicinales" },
              { v: 45000, s: "+", l: "Utilisateurs actifs" },
              { v: 20, s: "+", l: "Pays africains" },
            ].map((c, i) => (
              <div key={i} className="text-center px-4">
                <AnimatedCounter value={c.v} suffix={c.s} />
                <div className="text-[13px] text-[var(--color-text-muted)] mt-2 uppercase tracking-wide font-semibold">{c.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-[var(--brand-primary)] py-16">
        <div className="container-iwosan grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-white text-[28px] md:text-[36px]">Restez informé des dernières découvertes</h2>
            <p className="mt-3 text-white/70 text-[16px] leading-[1.7]">Une lettre mensuelle, sans bruit, avec les meilleurs articles et études cliniques publiés sur Iwosan.</p>
          </div>
          <form className="flex flex-col sm:flex-row gap-3">
            <input type="email" placeholder="votre@email.com" className="flex-1 h-12 px-5 rounded-full bg-white text-[15px] outline-none focus:ring-4 focus:ring-white/20" />
            <button className="h-12 px-7 rounded-full bg-[var(--brand-gold)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--brand-gold-light)] transition whitespace-nowrap">S'abonner</button>
          </form>
        </div>
      </section>
    </>
  );
}
