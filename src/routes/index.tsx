import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, MapPin, MessagesSquare, BookOpen, Stethoscope, FlaskConical, ChefHat, GraduationCap, ShoppingBag, Users, CalendarDays, Contact2, BadgeCheck, Search, ShieldCheck, Wallet, ReceiptText, MessageCircleMore, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProfessionalCard } from "@/components/shared/ProfessionalCard";
import { EventCard } from "@/components/shared/EventCard";
import { products } from "@/data/products";
import { professionals } from "@/data/professionals";
import { events } from "@/data/events";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IWOSAN - Plateforme panafricaine" },
      { name: "description", content: "Le savoir endogène africain, documenté, transmis, vivant." },
    ],
  }),
  component: Home,
});

const heroSlides = [
  {
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80&auto=format&fit=crop',
    eyebrow: 'PLATEFORME PANAFRICAINE',
    kicker: 'Savoir endogène africain',
    title: 'Le savoir endogène africain, documenté, transmis, vivant.',
    desc: 'Iwosan documente, valorise et met en relation les détenteurs de savoirs endogènes africains - dans le respect du sacré, des cadres scientifiques et des communautés qui les portent.',
    tags: ['Tout l’écosystème', 'Annuaire', 'Marketplace'],
    primary: { label: 'Explorer l’annuaire →', to: '/annuaire' },
    secondary: { label: 'Voir la marketplace', to: '/marketplace' },
  },
  {
    img: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=1920&q=80&auto=format&fit=crop',
    eyebrow: 'MARKETPLACE',
    kicker: 'Produits & services',
    title: 'Des produits certifiés et des services réservables.',
    desc: 'Chaque fiche peut être ouverte, partagée et reliée à la page officielle du professionnel pour réserver en confiance.',
    tags: ['Produits', 'Réservation', 'Profil pro'],
    primary: { label: 'Découvrir les produits', to: '/marketplace' },
    secondary: { label: 'Voir les pros', to: '/annuaire' },
  },
  {
    img: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1920&q=80&auto=format&fit=crop',
    eyebrow: 'CONNAISSANCE',
    kicker: 'Articles & dossiers',
    title: 'Un accès éditorial plus riche, plus lisible.',
    desc: 'Santé au quotidien, pharmacopée, recettes et rites culturels sont regroupés pour une navigation plus simple.',
    tags: ['Santé', 'Pharmacopée', 'Rites'],
    primary: { label: 'Lire les contenus', to: '/sante-au-quotidien' },
    secondary: { label: 'Explorer les recettes', to: '/recettes-sante' },
  },
  {
    img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1920&q=80&auto=format&fit=crop',
    eyebrow: 'COMMUNAUTÉ',
    kicker: 'Formations & agenda',
    title: 'Ateliers, formations et événements en une seule vue.',
    desc: 'Le site rassemble les rendez-vous utiles pour apprendre, échanger et rejoindre les bons espaces au bon moment.',
    tags: ['Agenda', 'Formations', 'Support'],
    primary: { label: 'Voir l’agenda', to: '/agenda' },
    secondary: { label: 'Découvrir les formations', to: '/formations' },
  },
] as const;

const modules = [
  { title: "Marketplace", desc: "Petites annonces : produits, services, digital", icon: ShoppingBag, to: '/marketplace' },
  { title: "Annuaire pro", desc: "Fiches détaillées des détenteurs de savoirs", icon: Users, to: '/pro/p1' },
  { title: "Recettes santé", desc: "Centre d'aide : base de connaissances + tickets", icon: ReceiptText, to: '/recettes-sante' },
  { title: "Portrait de la semaine", desc: "Un professionnel mis à l'honneur en accueil", icon: BadgeCheck, to: '/pro/p1' },
  { title: "Santé au quotidien", desc: "Blog communautaire par catégories", icon: Stethoscope, to: '/sante-au-quotidien' },
  { title: "Pharmacopée vivante", desc: "Monographies de plantes médicinales", icon: Leaf, to: '/pharmacopee' },
  { title: "Rites & Cultures", desc: "Exploration anthropologique et spirituelle", icon: FlaskConical, to: '/rites-cultures' },
  { title: "Discutons-en", desc: "Questions-réponses communautaires", icon: MessageCircleMore, to: '/discutons-en' },
  { title: "Agenda & Événements", desc: "Webconférences, formations, salons", icon: CalendarDays, to: '/agenda' },
  { title: "Espace Formations", desc: "Bibliothèque de documents et vidéos", icon: GraduationCap, to: '/formations' },
] as const;

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % heroSlides.length), 6500);
    return () => clearInterval(id);
  }, [paused]);

  const slide = heroSlides[index];

  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden bg-[var(--brand-primary-dark)] text-white" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={index} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.55 }} className="absolute inset-0">
          <img src={slide.img} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,39,24,0.92)_0%,rgba(31,90,57,0.72)_42%,rgba(45,122,79,0.36)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />
        </motion.div>
      </AnimatePresence>
      <button onClick={() => setIndex((index - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/12 text-white backdrop-blur hover:bg-white/20" aria-label="Slide précédente"><ChevronLeft size={24} /></button>
      <button onClick={() => setIndex((index + 1) % heroSlides.length)} className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/12 text-white backdrop-blur hover:bg-white/20" aria-label="Slide suivante"><ChevronRight size={24} /></button>
      <div className="relative container-iwosan flex min-h-[92vh] flex-col justify-center py-24">
        <div className="max-w-5xl">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] text-white/90 backdrop-blur">{slide.eyebrow}</span>
            <span className="rounded-full bg-[var(--brand-gold)] px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white shadow-iwosan-sm">{slide.kicker}</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-[40px] leading-[1.02] text-white md:text-[70px]">{slide.title}</h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-[1.85] text-white/86 md:text-[18px]">{slide.desc}</p>
          <div className="mt-8 flex flex-wrap gap-2">{slide.tags.map((tag) => <span key={tag} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white/92 backdrop-blur">{tag}</span>)}</div>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={slide.primary.to} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-gold)] px-7 font-semibold text-white shadow-iwosan-md">{slide.primary.label} <ArrowRight size={18} /></Link>
            <Link to={slide.secondary.to} className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-7 font-semibold text-white hover:bg-white/10">{slide.secondary.label}</Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">{heroSlides.map((_, dotIndex) => <button key={dotIndex} onClick={() => setIndex(dotIndex)} className={`h-2.5 rounded-full transition-all ${index === dotIndex ? "w-8 bg-white" : "w-2.5 bg-white/45"}`} aria-label={`Aller à la slide ${dotIndex + 1}`} />)}</div>
    </section>
  );
}
function ModulesStrip() {
  const slides = useMemo(() => {
    const chunkSize = 4;
    const chunks = [];
    for (let i = 0; i < modules.length; i += chunkSize) {
      chunks.push(modules.slice(i, i + chunkSize));
    }
    return chunks;
  }, []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((current) => (current + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--brand-border)] bg-white"><ChevronLeft size={18} /></button>
        <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Slide {index + 1} / {slides.length}</div>
        <button onClick={() => setIndex((i) => (i + 1) % slides.length)} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--brand-border)] bg-white"><ChevronRight size={18} /></button>
      </div>
      <div className="overflow-hidden rounded-[24px] border border-[var(--brand-border-light)] bg-white shadow-iwosan-md">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }} className="p-4 sm:p-6">
            <div className="grid gap-4">
              {slides[index].map((module) => (
                <Link key={module.title} to={module.to} className="group flex items-start gap-4 rounded-[18px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4 transition hover:border-[var(--brand-primary)] hover:bg-white">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand-primary)] text-white shadow-iwosan-sm"><module.icon size={21} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[18px] font-bold leading-tight">{module.title}</h3>
                      <ArrowRight className="shrink-0 text-[var(--brand-primary)] opacity-0 transition group-hover:opacity-100" size={16} />
                    </div>
                    <p className="mt-1 text-[13px] leading-6 text-[var(--color-text-secondary)]">{module.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center">
        <Link to="/annuaire" className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 font-semibold text-white">Explorer tout l’écosystème <ArrowRight size={18} /></Link>
      </div>
    </div>
  );
}

function Home() {
  const featuredProducts = products.slice(0, 4);
  const featuredProfessionals = professionals.slice(0, 4);
  const featuredEvents = events.slice(0, 3);

  return (
    <>
      <HeroCarousel />
      <section className="py-20 md:py-24 bg-[var(--brand-surface-alt)]">
        <div className="container-iwosan">
          <SectionHeader label="Modules" title="Tout l’écosystème du site" subtitle="Une lecture claire des espaces publics utiles, avec navigation verticale et accès rapide à chaque univers." align="center" />
          <ModulesStrip />
        </div>
      </section>
      <section className="py-20 md:py-24">
        <div className="container-iwosan">
          <SectionHeader label="Mise en lumière" title="Portrait de la semaine" />
          <div className="grid gap-6 md:grid-cols-[40%_60%] rounded-[24px] border border-[var(--brand-border-light)] bg-white overflow-hidden shadow-iwosan-md">
            <div className="h-[300px] md:h-auto">
              <img src={featuredProfessionals[0].cover} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-7 md:p-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-gold)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">Praticien de la semaine</span>
              <h3 className="mt-4 text-[28px] md:text-[32px] text-[var(--brand-primary)] font-bold">{featuredProfessionals[0].name}</h3>
              <p className="mt-1 text-[15px] text-[var(--color-text-secondary)]">{featuredProfessionals[0].specialty}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-[var(--color-text-muted)]"><MapPin size={14} /> {featuredProfessionals[0].location}, {featuredProfessionals[0].country}</p>
              <p className="mt-5 text-[15px] leading-[1.7] text-[var(--color-text-secondary)]">{featuredProfessionals[0].bio}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/annuaire/$id" params={{ id: featuredProfessionals[0].id }} className="h-11 inline-flex items-center justify-center px-5 rounded-full bg-[var(--brand-primary)] text-white font-semibold">Voir le profil complet</Link>
                <Link to="/annuaire" className="h-11 inline-flex items-center justify-center px-5 rounded-full border border-[var(--brand-border)] font-semibold">Explorer</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 md:py-24 bg-[var(--brand-surface-alt)]">
        <div className="container-iwosan">
          <SectionHeader label="Marketplace" title="Produits en avant" align="center" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>
      <section className="py-20 md:py-24">
        <div className="container-iwosan">
          <SectionHeader label="Annuaire" title="Praticiens en vedette" align="center" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{featuredProfessionals.map((pro) => <ProfessionalCard key={pro.id} pro={pro} />)}</div>
        </div>
      </section>
      <section className="py-20 md:py-24 bg-[var(--brand-surface-alt)]">
        <div className="container-iwosan">
          <SectionHeader label="Agenda" title="Événements à venir" align="center" />
          <div className="space-y-4">{featuredEvents.map((event) => <EventCard key={event.id} event={event} actionLabel="S'inscrire" />)}</div>
        </div>
      </section>
      <section className="border-t border-[var(--brand-border-light)] bg-[var(--brand-primary-dark)] py-14 text-white">
        <div className="container-iwosan grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
            <div className="text-[38px] font-bold leading-none">50+</div>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.18em] text-white/72">Praticiens documentés</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
            <div className="text-[38px] font-bold leading-none">120+</div>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.18em] text-white/72">Plantes médicinales</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
            <div className="text-[38px] font-bold leading-none">4000+</div>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.18em] text-white/72">Utilisateurs actifs</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
            <div className="text-[38px] font-bold leading-none">10+</div>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.18em] text-white/72">Pays africains</p>
          </div>
        </div>
      </section>
    </>
  );
}


