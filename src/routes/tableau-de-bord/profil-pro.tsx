import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { BarChart3, CalendarDays, CheckCircle2, MapPin, ShoppingBag, Star } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { RatingStars } from "@/components/shared/RatingStars";
import { useMyBookings } from "@/hooks/useBookingsApi";
import { useMyProducts } from "@/hooks/useApiCatalog";
import { useMyOrders } from "@/hooks/useOrdersApi";
import { useMyProfessionalProfile } from "@/hooks/useProfessionalApi";

export const Route = createFileRoute("/tableau-de-bord/profil-pro")({
  head: () => ({ meta: [{ title: "Vitrine pro - IWOSAN" }] }),
  component: ProfessionalShowcasePage,
});

function ProfessionalShowcasePage() {
  const profileQuery = useMyProfessionalProfile();
  const bookingsQuery = useMyBookings("professional");
  const productsQuery = useMyProducts();
  const ordersQuery = useMyOrders("seller");

  const profile = profileQuery.data?.data;
  const products = productsQuery.data ?? [];
  const orders = (ordersQuery.data?.data ?? []) as { id: string }[];
  const pendingBookingsCount = (bookingsQuery.data ?? []).filter((booking) => booking.status === "PENDING").length;
  const activeProductsCount = products.filter((product) => product.isActive).length;

  const stats = useMemo(
    () => [
      { label: "Note moyenne", value: profile ? profile.averageRating.toFixed(1) : "—", icon: Star },
      { label: "Avis reçus", value: profile ? String(profile.totalReviews) : "0", icon: CheckCircle2 },
      { label: "Annonces actives", value: String(activeProductsCount), icon: ShoppingBag },
      { label: "Commandes reçues", value: String(orders.length), icon: CalendarDays },
    ],
    [profile, activeProductsCount, orders.length],
  );

  if (profileQuery.isLoading) {
    return (
      <ProtectedRoute>
        <AccountLayout>
          <p className="py-16 text-center text-[14px] text-[var(--color-text-muted)]">Chargement de votre vitrine...</p>
        </AccountLayout>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <AccountLayout>
          <div className="py-16 text-center">
            <p className="text-[16px] font-semibold">Aucun profil professionnel trouvé.</p>
            <Link to="/devenir-pro" className="mt-4 inline-flex rounded-full bg-[var(--brand-primary)] px-5 py-3 font-semibold text-white">
              Créer mon profil professionnel
            </Link>
          </div>
        </AccountLayout>
      </ProtectedRoute>
    );
  }

  const avatar = profile.photos[0] ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80";
  const cover = profile.photos[1] ?? profile.photos[0] ?? "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=1600&q=80";

  return (
    <ProtectedRoute>
      <AccountLayout>
        <section className="relative -m-5 mb-8 overflow-hidden rounded-[24px] bg-[var(--brand-primary-dark)] text-white md:-m-8 md:mb-8">
          <div className="absolute inset-0">
            <img src={cover} alt="" className="h-full w-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(31,90,57,.25),rgba(31,90,57,.92))]" />
          </div>
          <div className="relative px-6 py-16 md:px-10 md:py-20">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--brand-gold)]">VITRINE PROFESSIONNELLE</p>
                <h1 className="mt-4 text-[36px] md:text-[62px] text-white">{profile.displayName}</h1>
                <p className="mt-3 max-w-2xl text-white/80">{profile.specialty[0] ?? "Praticien traditionnel"}</p>
                <p className="mt-2 inline-flex items-center gap-2 text-white/75"><MapPin size={16} /> {profile.location}</p>
                <div className="mt-4 flex items-center gap-3">
                  <RatingStars rating={profile.averageRating} reviewCount={profile.totalReviews} size="md" />
                  {profile.isVerified && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-gold)] px-3 py-1 text-[12px] font-bold text-white"><CheckCircle2 size={14} /> Vérifié</span>}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center gap-4">
                  <img src={avatar} alt={profile.displayName} className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg" />
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/75">Compte pro</p>
                    <h2 className="mt-1 text-[24px] text-white">Profil public</h2>
                    <p className="mt-1 text-[13px] text-white/75">Administrez votre visibilité et vos réservations.</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <Link to="/pro/$id" params={{ id: profile.userId }} className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[13px] font-semibold text-white">Voir la page publique</Link>
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
                <p className="mt-4 text-[15px] leading-8 text-[var(--color-text-secondary)]">{profile.biography}</p>
              </section>

              <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6">
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--brand-primary)]">ACTIVITÉ RÉCENTE</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-[var(--brand-primary-subtle)] p-4">
                    <p className="text-[13px] font-semibold text-[var(--brand-primary)]">Produits publiés</p>
                    <p className="mt-1 text-[28px] font-bold">{products.length}</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--brand-primary-subtle)] p-4">
                    <p className="text-[13px] font-semibold text-[var(--brand-primary)]">Demandes en attente</p>
                    <p className="mt-1 text-[28px] font-bold">{String(pendingBookingsCount).padStart(2, "0")}</p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-4 rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6 lg:sticky lg:top-24 h-fit">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-[var(--brand-primary)]" size={20} />
                <h2 className="text-[20px] font-bold">Actions rapides</h2>
              </div>
              <Link to="/devenir-pro" className="block rounded-full bg-[var(--brand-primary)] px-4 py-3 text-center font-semibold text-white">Modifier mon profil</Link>
              <Link to="/tableau-de-bord/mes-produits" className="block rounded-full border border-[var(--brand-border)] px-4 py-3 text-center font-semibold">Gérer mes produits</Link>
              <Link to="/tableau-de-bord/commandes" className="block rounded-full border border-[var(--brand-border)] px-4 py-3 text-center font-semibold">Voir mes commandes</Link>
              <Link to="/tableau-de-bord/commissions" className="block rounded-full border border-[var(--brand-border)] px-4 py-3 text-center font-semibold">Commissions</Link>
              <div className="rounded-2xl bg-[var(--brand-surface-alt)] p-4">
                <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">RÉSUMÉ</p>
                <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">Vous pouvez gérer votre présence publique à partir de cette page vitrine et renvoyer les visiteurs vers votre profil annuaire.</p>
              </div>
            </aside>
          </div>
        </section>
      </AccountLayout>
    </ProtectedRoute>
  );
}
