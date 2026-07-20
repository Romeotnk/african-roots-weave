import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { BarChart3, CalendarDays, CheckCircle2, Eye, MapPin, MessageSquare, ShoppingBag, Star, Users } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { professionals } from "@/data/professionals";
import { products } from "@/data/products";
import { events } from "@/data/events";
import { RatingStars } from "@/components/shared/RatingStars";

export const Route = createFileRoute("/tableau-de-bord/profil-pro")({
  head: () => ({ meta: [{ title: "Vitrine pro - IWOSAN" }] }),
  component: ProfessionalShowcasePage,
});

function ProfessionalShowcasePage() {
  const pro = professionals[0];
  const productCount = products.filter((product) => product.sellerId === pro.id).length;
  const upcomingCount = events.filter((event) => new Date(event.date).getTime() >= Date.now()).length;
  const stats = useMemo(() => [
    { label: "Vues", value: "12.4k", icon: Eye },
    { label: "Clients", value: "420", icon: Users },
    { label: "Services", value: `${productCount}`, icon: ShoppingBag },
    { label: "Événements", value: `${upcomingCount}`, icon: CalendarDays },
  ], [productCount, upcomingCount]);

  return (
    <ProtectedRoute>
      <main className="bg-[var(--brand-bg)]">
        <section className="relative overflow-hidden bg-[var(--brand-primary-dark)] text-white">
          <div className="absolute inset-0">
            <img src={pro.cover} alt="" className="h-full w-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(31,90,57,.25),rgba(31,90,57,.92))]" />
          </div>
          <div className="relative container-iwosan py-16 md:py-20">
            <AccountBackLink />
            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--brand-gold)]">VITRINE PROFESSIONNELLE</p>
                <h1 className="mt-4 text-[36px] md:text-[62px] text-white">{pro.name}</h1>
                <p className="mt-3 max-w-2xl text-white/80">{pro.specialty}</p>
                <p className="mt-2 inline-flex items-center gap-2 text-white/75"><MapPin size={16} /> {pro.location}, {pro.country}</p>
                <div className="mt-4 flex items-center gap-3">
                  <RatingStars rating={pro.rating} reviewCount={pro.reviewCount} size="md" />
                  {pro.verified && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-gold)] px-3 py-1 text-[12px] font-bold text-white"><CheckCircle2 size={14} /> Vérifié</span>}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center gap-4">
                  <img src={pro.avatar} alt={pro.name} className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg" />
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/75">Compte pro</p>
                    <h2 className="mt-1 text-[24px] text-white">Profil public</h2>
                    <p className="mt-1 text-[13px] text-white/75">Administrez votre visibilité et vos réservations.</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <Link to="/annuaire/$id" params={{ id: pro.id }} className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[13px] font-semibold text-white">Voir la page publique</Link>
                  <Link to="/messages" className="rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-white">Messages</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-iwosan py-10">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-[22px] border border-[var(--brand-border-light)] bg-white p-5 shadow-iwosan-sm">
                <div className="flex items-center justify-between text-[var(--brand-primary)]">
                  <stat.icon size={18} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{stat.label}</span>
                </div>
                <div className="mt-4 text-[32px] font-bold text-[var(--brand-primary)]">{stat.value}</div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6">
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--brand-primary)]">À PROPOS</p>
                <p className="mt-4 text-[15px] leading-8 text-[var(--color-text-secondary)]">{pro.bio} Cette vitrine est pensée pour mettre en avant votre expertise, vos services, vos produits et vos actualités dans un format premium orienté conversion et confiance.</p>
              </section>

              <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6">
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--brand-primary)]">ACTIVITÉ RÉCENTE</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-[var(--brand-primary-subtle)] p-4">
                    <p className="text-[13px] font-semibold text-[var(--brand-primary)]">Produits publiés</p>
                    <p className="mt-1 text-[28px] font-bold">{productCount}</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--brand-primary-subtle)] p-4">
                    <p className="text-[13px] font-semibold text-[var(--brand-primary)]">Demandes en attente</p>
                    <p className="mt-1 text-[28px] font-bold">08</p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-4 rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 lg:sticky lg:top-24 h-fit">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-[var(--brand-primary)]" size={20} />
                <h2 className="text-[20px] font-bold">Actions rapides</h2>
              </div>
              <Link to="/tableau-de-bord/profil" className="block rounded-full bg-[var(--brand-primary)] px-4 py-3 text-center font-semibold text-white">Modifier mon profil</Link>
              <Link to="/tableau-de-bord/mes-produits" className="block rounded-full border border-[var(--brand-border)] px-4 py-3 text-center font-semibold">Gérer mes produits</Link>
              <Link to="/tableau-de-bord/commandes" className="block rounded-full border border-[var(--brand-border)] px-4 py-3 text-center font-semibold">Voir mes commandes</Link>
              <Link to="/tableau-de-bord/commissions" className="block rounded-full border border-[var(--brand-border)] px-4 py-3 text-center font-semibold">Commissions</Link>
              <div className="rounded-2xl bg-[var(--brand-surface-alt)] p-4">
                <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">RÉSUMÉ</p>
                <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">Vous pouvez maintenant gérer votre présence publique à partir de cette page vitrine et renvoyer les visiteurs vers votre profil annuaire.</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}

