import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, MapPin, MessagesSquare, BookOpen, Stethoscope, FlaskConical, ChefHat, GraduationCap, ShoppingBag, Users, CalendarDays, Contact2, BadgeCheck, Search, ShieldCheck, Wallet, ReceiptText, MessageCircleMore, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AdSlot } from "@/components/shared/AdSlot";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProfessionalCard } from "@/components/shared/ProfessionalCard";
import { EventCard } from "@/components/shared/EventCard";
import { PartnerLogosBar } from "@/components/shared/PartnerLogosBar";
import { getSiteConfig } from "@/lib/api/site";
import { useHomeBanners, useSiteConfig } from "@/hooks/useSiteConfig";
import { parseHomepageSections, type HomepageSectionKey } from "@/lib/homepageSections";
import { useProducts, useProfessionals } from "@/hooks/useApiCatalog";
import { useEvents } from "@/hooks/useEventsFormationsApi";
import { toEventItem, type BackendEvent } from "@/lib/eventMappers";
import type { EventItem } from "@/types";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const response = await getSiteConfig();
      return response.data ?? {};
    } catch {
      return {};
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.["site.home.metaTitle"] || "IWOSAN - Plateforme panafricaine" },
      {
        name: "description",
        content: loaderData?.["site.home.metaDescription"] || "Le savoir endogène africain, documenté, transmis, vivant.",
      },
    ],
  }),
  component: Home,
});

type Slide = {
  img: string;
  eyebrow?: string;
  kicker?: string;
  title: string;
  desc?: string;
  tags?: string[];
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};

// Same figures as the full stats section further down the page — repeated
// here, condensed, so the trust signal lands immediately in the hero instead
// of only after scrolling.
const buildHeroTrustStats = (t: TFunction) => [
  { icon: Users, value: "50+", label: t("home.hero.trustPractitioners") },
  { icon: Leaf, value: "120+", label: t("home.hero.trustPlants") },
  { icon: MapPin, value: "10+", label: t("home.hero.trustCountries") },
];

const buildFallbackHeroSlides = (t: TFunction): Slide[] => [
  {
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80&auto=format&fit=crop',
    eyebrow: t("home.hero.slide1.eyebrow"),
    kicker: t("home.hero.slide1.kicker"),
    title: t("home.hero.slide1.title"),
    desc: t("home.hero.slide1.desc"),
    tags: [t("home.hero.slide1.tag1"), t("home.hero.slide1.tag2"), t("home.hero.slide1.tag3")],
    primary: { label: t("home.hero.slide1.primaryLabel"), href: '/annuaire' },
    secondary: { label: t("home.hero.slide1.secondaryLabel"), href: '/marketplace' },
  },
  {
    img: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=1920&q=80&auto=format&fit=crop',
    eyebrow: t("home.hero.slide2.eyebrow"),
    kicker: t("home.hero.slide2.kicker"),
    title: t("home.hero.slide2.title"),
    desc: t("home.hero.slide2.desc"),
    tags: [t("home.hero.slide2.tag1"), t("home.hero.slide2.tag2"), t("home.hero.slide2.tag3")],
    primary: { label: t("home.hero.slide2.primaryLabel"), href: '/marketplace' },
    secondary: { label: t("home.hero.slide2.secondaryLabel"), href: '/annuaire' },
  },
  {
    img: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1920&q=80&auto=format&fit=crop',
    eyebrow: t("home.hero.slide3.eyebrow"),
    kicker: t("home.hero.slide3.kicker"),
    title: t("home.hero.slide3.title"),
    desc: t("home.hero.slide3.desc"),
    tags: [t("home.hero.slide3.tag1"), t("home.hero.slide3.tag2"), t("home.hero.slide3.tag3")],
    primary: { label: t("home.hero.slide3.primaryLabel"), href: '/sante-au-quotidien' },
    secondary: { label: t("home.hero.slide3.secondaryLabel"), href: '/recettes-sante' },
  },
  {
    img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1920&q=80&auto=format&fit=crop',
    eyebrow: t("home.hero.slide4.eyebrow"),
    kicker: t("home.hero.slide4.kicker"),
    title: t("home.hero.slide4.title"),
    desc: t("home.hero.slide4.desc"),
    tags: [t("home.hero.slide4.tag1"), t("home.hero.slide4.tag2"), t("home.hero.slide4.tag3")],
    primary: { label: t("home.hero.slide4.primaryLabel"), href: '/agenda' },
    secondary: { label: t("home.hero.slide4.secondaryLabel"), href: '/formations' },
  },
];

const buildModules = (t: TFunction) => [
  { title: t("home.modules.marketplace.title"), desc: t("home.modules.marketplace.desc"), icon: ShoppingBag, to: '/marketplace' },
  { title: t("home.modules.annuaire.title"), desc: t("home.modules.annuaire.desc"), icon: Users, to: '/annuaire' },
  { title: t("home.modules.recettes.title"), desc: t("home.modules.recettes.desc"), icon: ReceiptText, to: '/recettes-sante' },
  { title: t("home.modules.portrait.title"), desc: t("home.modules.portrait.desc"), icon: BadgeCheck, to: '/annuaire' },
  { title: t("home.modules.quotidien.title"), desc: t("home.modules.quotidien.desc"), icon: Stethoscope, to: '/sante-au-quotidien' },
  { title: t("home.modules.pharmacopee.title"), desc: t("home.modules.pharmacopee.desc"), icon: Leaf, to: '/pharmacopee' },
  { title: t("home.modules.rites.title"), desc: t("home.modules.rites.desc"), icon: FlaskConical, to: '/rites-cultures' },
  { title: t("home.modules.forum.title"), desc: t("home.modules.forum.desc"), icon: MessageCircleMore, to: '/discutons-en' },
  { title: t("home.modules.agenda.title"), desc: t("home.modules.agenda.desc"), icon: CalendarDays, to: '/agenda' },
  { title: t("home.modules.formations.title"), desc: t("home.modules.formations.desc"), icon: GraduationCap, to: '/formations' },
] as const;

function HeroCarousel() {
  const { t } = useTranslation();
  const { data: bannersResponse } = useHomeBanners();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const heroTrustStats = useMemo(() => buildHeroTrustStats(t), [t]);

  const heroSlides = useMemo<Slide[]>(() => {
    const banners = bannersResponse?.data ?? [];
    if (banners.length === 0) return buildFallbackHeroSlides(t);
    return banners.map((banner) => ({
      img: banner.imageUrl,
      title: banner.title || t("home.hero.defaultBannerTitle"),
      primary: { label: t("home.hero.defaultBannerCta"), href: banner.link || "/annuaire" },
    }));
  }, [bannersResponse, t]);

  useEffect(() => {
    setIndex(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % heroSlides.length), 6500);
    return () => clearInterval(id);
  }, [paused, heroSlides.length]);

  const slide = heroSlides[index];
  if (!slide) return null;

  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden bg-[var(--brand-primary-dark)] text-white" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={index} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.55 }} className="absolute inset-0">
          <img src={slide.img} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,39,24,0.92)_0%,rgba(31,90,57,0.72)_42%,rgba(45,122,79,0.36)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />
        </motion.div>
      </AnimatePresence>
      {heroSlides.length > 1 && (
        <>
          <button onClick={() => setIndex((index - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white" aria-label={t("home.hero.prevSlide")}><ChevronLeft size={18} /></button>
          <button onClick={() => setIndex((index + 1) % heroSlides.length)} className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white" aria-label={t("home.hero.nextSlide")}><ChevronRight size={18} /></button>
        </>
      )}
      <div className="relative container-iwosan grid min-h-[92vh] items-center gap-10 py-24 lg:grid-cols-[1fr_320px]">
        <div className="max-w-5xl">
          {(slide.eyebrow || slide.kicker) && (
            <div className="flex flex-wrap gap-3">
              {slide.eyebrow && <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] text-white/90 backdrop-blur">{slide.eyebrow}</span>}
              {slide.kicker && <span className="rounded-full bg-[var(--brand-gold)] px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white shadow-iwosan-sm">{slide.kicker}</span>}
            </div>
          )}
          <h1 className="mt-6 max-w-4xl text-[40px] leading-[1.02] text-white md:text-[70px]">{slide.title}</h1>
          {slide.desc && <p className="mt-5 max-w-2xl text-[16px] leading-[1.85] text-white/86 md:text-[18px]">{slide.desc}</p>}
          {slide.tags && slide.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">{slide.tags.map((tag) => <span key={tag} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white/92 backdrop-blur">{tag}</span>)}</div>
          )}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href={slide.primary.href} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-gold)] px-7 font-semibold text-white shadow-iwosan-md">{slide.primary.label} <ArrowRight size={18} /></a>
            {slide.secondary && <a href={slide.secondary.href} className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-7 font-semibold text-white hover:bg-white/10">{slide.secondary.label}</a>}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden rounded-[24px] border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md lg:block"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">{t("home.hero.inFigures")}</p>
          <div className="mt-5 space-y-5">
            {heroTrustStats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-gold)]/20 text-[var(--brand-gold)]">
                  <stat.icon size={18} />
                </div>
                <div>
                  <p className="text-[22px] font-bold leading-none text-white">{stat.value}</p>
                  <p className="mt-1 text-[12px] text-white/70">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      {heroSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">{heroSlides.map((_, dotIndex) => <button key={dotIndex} onClick={() => setIndex(dotIndex)} className={`h-2.5 rounded-full transition-all ${index === dotIndex ? "w-8 bg-white" : "w-2.5 bg-white/45"}`} aria-label={t("home.hero.goToSlide", { n: dotIndex + 1 })} />)}</div>
      )}
    </section>
  );
}
function ModulesStrip() {
  const { t } = useTranslation();
  const modules = useMemo(() => buildModules(t), [t]);
  const slides = useMemo(() => {
    const chunkSize = 4;
    const chunks = [];
    for (let i = 0; i < modules.length; i += chunkSize) {
      chunks.push(modules.slice(i, i + chunkSize));
    }
    return chunks;
  }, [modules]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((current) => (current + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--brand-border)] bg-white"><ChevronLeft size={18} /></button>
        <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{t("home.modules.slideCounter", { current: index + 1, total: slides.length })}</div>
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
        <Link to="/annuaire" className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 font-semibold text-white">{t("home.modules.exploreAll")} <ArrowRight size={18} /></Link>
      </div>
    </div>
  );
}

function Home() {
  const { t } = useTranslation();
  const siteConfigQuery = useSiteConfig();
  const announcement = siteConfigQuery.data?.data?.["site.home.announcement"]?.trim();
  const sectionsConfig = useMemo(
    () => parseHomepageSections(siteConfigQuery.data?.data?.["homepage.sections"]),
    [siteConfigQuery.data],
  );

  const emptyParams = useMemo(() => new URLSearchParams(), []);
  const portraitParams = useMemo(() => new URLSearchParams({ portraitOfWeek: "true", limit: "1" }), []);
  const productsQuery = useProducts(emptyParams);
  const professionalsQuery = useProfessionals(emptyParams);
  const portraitQuery = useProfessionals(portraitParams);
  const eventsQuery = useEvents();

  const apiEvents = useMemo(
    () => ((eventsQuery.data?.events ?? []) as BackendEvent[]).map((event) => toEventItem(event, t)).filter((item): item is EventItem => Boolean(item)),
    [eventsQuery.data, t],
  );

  const apiProducts = productsQuery.data?.products ?? [];
  const apiProfessionals = professionalsQuery.data?.professionals ?? [];
  const featuredProducts = apiProducts.slice(0, 4);
  const featuredProfessionals = apiProfessionals.slice(0, 4);
  const featuredEvents = apiEvents.slice(0, 3);
  const portraitOfWeek = portraitQuery.data?.professionals?.[0] ?? featuredProfessionals[0];

  const sectionRenderers: Record<HomepageSectionKey, () => ReactNode> = {
    modules: () => (
      <section key="modules" className="py-20 md:py-24 bg-[var(--brand-surface-alt)]">
        <div className="container-iwosan">
          <SectionHeader label={t("home.modules.sectionLabel")} title={t("home.modules.sectionTitle")} subtitle={t("home.modules.sectionSubtitle")} align="center" />
          <ModulesStrip />
        </div>
      </section>
    ),
    portrait: () => !portraitOfWeek ? null : (
      <section key="portrait" className="py-20 md:py-24">
        <div className="container-iwosan">
          <SectionHeader label={t("home.portraitSection.sectionLabel")} title={t("home.portraitSection.sectionTitle")} />
          <div className="grid gap-6 md:grid-cols-[40%_60%] rounded-[24px] border border-[var(--brand-border-light)] bg-white overflow-hidden shadow-iwosan-md">
            <div className="h-[300px] md:h-auto">
              <img src={portraitOfWeek.cover} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-7 md:p-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-gold)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">{t("home.portraitSection.badge")}</span>
              <h3 className="mt-4 text-[28px] md:text-[32px] text-[var(--brand-primary)] font-bold">{portraitOfWeek.name}</h3>
              <p className="mt-1 text-[15px] text-[var(--color-text-secondary)]">{portraitOfWeek.specialty}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-[var(--color-text-muted)]"><MapPin size={14} /> {portraitOfWeek.location}, {portraitOfWeek.country}</p>
              <p className="mt-5 text-[15px] leading-[1.7] text-[var(--color-text-secondary)]">{portraitOfWeek.bio}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/pro/$id" params={{ id: portraitOfWeek.id }} className="h-11 inline-flex items-center justify-center px-5 rounded-full bg-[var(--brand-primary)] text-white font-semibold">{t("home.portraitSection.viewProfile")}</Link>
                <Link to="/annuaire" className="h-11 inline-flex items-center justify-center px-5 rounded-full border border-[var(--brand-border)] font-semibold">{t("home.portraitSection.explore")}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    products: () => featuredProducts.length === 0 ? null : (
      <section key="products" className="py-20 md:py-24 bg-[var(--brand-surface-alt)]">
        <div className="container-iwosan">
          <SectionHeader label={t("home.sections.productsLabel")} title={t("home.sections.productsTitle")} align="center" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>
    ),
    professionals: () => featuredProfessionals.length === 0 ? null : (
      <section key="professionals" className="py-20 md:py-24">
        <div className="container-iwosan">
          <SectionHeader label={t("home.sections.professionalsLabel")} title={t("home.sections.professionalsTitle")} align="center" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{featuredProfessionals.map((pro) => <ProfessionalCard key={pro.id} pro={pro} />)}</div>
        </div>
      </section>
    ),
    events: () => featuredEvents.length === 0 ? null : (
      <section key="events" className="py-20 md:py-24 bg-[var(--brand-surface-alt)]">
        <div className="container-iwosan">
          <SectionHeader label={t("home.sections.eventsLabel")} title={t("home.sections.eventsTitle")} align="center" />
          <div className="space-y-4">{featuredEvents.map((event) => <EventCard key={event.id} event={event} actionLabel={t("home.sections.eventsAction")} />)}</div>
        </div>
      </section>
    ),
  };

  return (
    <>
      {announcement && (
        <div className="bg-[var(--brand-gold)] px-4 py-2.5 text-center text-[13px] font-semibold text-[var(--brand-primary-dark)]">
          {announcement}
        </div>
      )}
      <HeroCarousel />
      <div className="container-iwosan pt-8">
        <AdSlot position="home_top" />
      </div>
      {sectionsConfig.filter((section) => section.enabled).map((section) => sectionRenderers[section.key]())}
      <section className="border-t border-[var(--brand-border-light)] bg-[var(--brand-primary-dark)] py-14 text-white">
        <div className="container-iwosan grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
            <div className="text-[38px] font-bold leading-none">50+</div>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.18em] text-white/72">{t("home.stats.practitioners")}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
            <div className="text-[38px] font-bold leading-none">120+</div>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.18em] text-white/72">{t("home.stats.plants")}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
            <div className="text-[38px] font-bold leading-none">4000+</div>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.18em] text-white/72">{t("home.stats.users")}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
            <div className="text-[38px] font-bold leading-none">10+</div>
            <p className="mt-2 text-[12px] font-semibold tracking-[0.18em] text-white/72">{t("home.stats.countries")}</p>
          </div>
        </div>
      </section>
      <PartnerLogosBar />
    </>
  );
}


