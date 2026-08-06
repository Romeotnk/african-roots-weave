import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountLayout } from "@/components/account/AccountLayout";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  FileText,
  GraduationCap,
  Layers,
  Link2,
  HelpCircle,
  MessageSquare,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Settings,
  Star,
  Tag,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth/AuthContext";
import { isProfessionalAccount, USER_ACCOUNT_ROLES } from "@/lib/auth/roles";
import { useMyBookings } from "@/hooks/useBookingsApi";

export const Route = createFileRoute("/mon-compte")({
  head: () => ({ meta: [{ title: "Mon compte - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={USER_ACCOUNT_ROLES}>
      <AccountHome />
    </ProtectedRoute>
  ),
});

const personalSections = [
  { title: "Mes commandes", desc: "Achats, remboursements et suivi.", to: "/mes-commandes", icon: ShoppingBag },
  { title: "Messages", desc: "Conversations avec vendeurs, praticiens et support.", to: "/messages", icon: MessageSquare },
  { title: "Portefeuille", desc: "Solde, transactions et demandes.", to: "/mon-compte/portefeuille", icon: Wallet },
  { title: "Profil", desc: "Identite, pays et preferences.", to: "/mon-compte/profil", icon: User },
  { title: "Inscriptions", desc: "Evenements, formations et billets.", to: "/mon-compte/inscriptions", icon: Calendar },
  { title: "Questions", desc: "Questions publiees, suivis et reponses.", to: "/mon-compte/questions", icon: MessageSquare },
  { title: "KYC", desc: "Verification d'identite et statut.", to: "/mon-compte/kyc", icon: ShieldCheck },
  { title: "Notifications", desc: "Messages, commandes et alertes.", to: "/mon-compte/notifications", icon: Bell },
  { title: "Reservations", desc: "Rendez-vous demandes aupres des professionnels.", to: "/mon-compte/reservations", icon: Calendar },
  { title: "Devis", desc: "Demandes de devis et propositions recues.", to: "/mon-compte/devis", icon: FileText },
  { title: "Alertes", desc: "Recherches sauvegardees marketplace.", to: "/mon-compte/alertes", icon: BookOpen },
  { title: "Favoris", desc: "Questions du forum enregistrees.", to: "/mon-compte/favoris", icon: Sparkles },
  { title: "Tickets", desc: "Conversations avec le support.", to: "/mon-compte/tickets", icon: HelpCircle },
  { title: "Parametres", desc: "Langue, securite et preferences.", to: "/mon-compte/parametres", icon: Settings },
];

const proSections = [
  { title: "Tableau de bord", desc: "Vue globale de votre activite professionnelle.", to: "/tableau-de-bord", icon: BriefcaseBusiness },
  { title: "Mes produits", desc: "Catalogue, stock, publications et moderation.", to: "/tableau-de-bord/mes-produits", icon: ShoppingBag },
  { title: "Commandes", desc: "Ventes, traitements et expeditions.", to: "/tableau-de-bord/commandes", icon: Package },
  { title: "Reservations", desc: "Demandes de rendez-vous de vos clients.", to: "/tableau-de-bord/reservations", icon: Calendar },
  { title: "Devis", desc: "Demandes de devis a traiter.", to: "/tableau-de-bord/devis", icon: FileText },
  { title: "Coupons", desc: "Codes promotionnels et campagnes.", to: "/tableau-de-bord/coupons", icon: Tag },
  { title: "Mon abonnement", desc: "Forfait, limites d'annonces et de telechargements.", to: "/tableau-de-bord/abonnement", icon: Layers },
  { title: "Formations", desc: "Ressources, cours et publications.", to: "/tableau-de-bord/formations", icon: GraduationCap },
  { title: "Evenements", desc: "Agenda, salons, ateliers et inscriptions.", to: "/tableau-de-bord/evenements", icon: Calendar },
  { title: "Questions", desc: "Forum, reponses et expertise communautaire.", to: "/tableau-de-bord/questions", icon: MessageSquare },
  { title: "Avis", desc: "Avis recus et reponses publiques.", to: "/tableau-de-bord/avis", icon: Star },
  { title: "Support utilisateurs", desc: "Repondre aux tickets ouverts du centre d'aide.", to: "/tableau-de-bord/support", icon: HelpCircle },
  { title: "Reseau MLM", desc: "Arbre de filleuls et commissions reseau.", to: "/tableau-de-bord/reseau", icon: Users },
  { title: "Affiliation", desc: "Lien de parrainage et commissions par vente.", to: "/tableau-de-bord/affiliation", icon: Link2 },
];

function AccountHome() {
  const { user, roles } = useAuth();
  const { data: bookings } = useMyBookings("client");
  const upcomingBookings = (bookings ?? [])
    .filter((booking) => booking.status === "PENDING" || booking.status === "CONFIRMED")
    .slice(0, 3);
  const [showProPrompt, setShowProPrompt] = useState(true);
  const name = (user?.user_metadata?.first_name as string | undefined) || user?.email?.split("@")[0] || "Compte";
  const isProAccount = isProfessionalAccount(roles);

  return (
    <AccountLayout
      title={`Bonjour ${name}`}
      description={
        isProAccount
          ? "Votre compte professionnel regroupe vos ventes, contenus, rendez-vous, avis et outils de croissance."
          : "Votre compte personnel regroupe vos achats, messages, alertes, tickets et preferences."
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {isProAccount ? (
          <Link to="/tableau-de-bord" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-bold text-white">
            <BriefcaseBusiness size={17} /> Ouvrir le tableau de bord
          </Link>
        ) : (
          <Link to="/devenir-pro" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-bold text-white">
            <Sparkles size={17} /> Devenir professionnel
          </Link>
        )}
        <Link to="/messages" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--brand-border-light)] bg-white px-5 text-[14px] font-bold text-[var(--color-text-primary)]">
          <MessageSquare size={17} /> Messages
        </Link>
      </div>

      <div>
        {upcomingBookings.length > 0 && (
          <div className="mb-8 grid gap-4 rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 shadow-iwosan-md lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Réservations</p>
              <h2 className="mt-2 text-[24px] font-extrabold">Vos prochains rendez-vous</h2>
              <p className="mt-2 text-[14px] leading-7 text-[var(--color-text-muted)]">Suivi de vos demandes de réservation auprès des professionnels.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="rounded-[18px] bg-[var(--brand-surface-alt)] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
                    {booking.status === "PENDING" ? "En attente" : "Confirmée"}
                  </p>
                  <p className="mt-2 text-[14px] font-semibold leading-6">{booking.serviceName}</p>
                  <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                    {booking.professional.professionalProfile?.displayName ?? `${booking.professional.firstName} ${booking.professional.lastName}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isProAccount && showProPrompt && (
          <div className="mb-6 rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5 shadow-iwosan-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                  <BriefcaseBusiness size={22} />
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Compte professionnel</p>
                  <h2 className="mt-1 text-[20px] font-extrabold">Vous souhaitez vendre, publier ou proposer vos services ?</h2>
                  <p className="mt-1 text-[13px] leading-6 text-[var(--color-text-muted)]">
                    Vous pouvez créer votre profil professionnel maintenant ou continuer avec votre compte utilisateur.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link to="/devenir-pro" className="btn-primary h-10 px-4 text-[13px]">Le faire maintenant</Link>
                <button type="button" onClick={() => setShowProPrompt(false)} className="btn-secondary h-10 px-4 text-[13px]">
                  Plus tard
                </button>
                <button type="button" onClick={() => setShowProPrompt(false)} aria-label="Fermer" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border-light)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                  <X size={17} />
                </button>
              </div>
            </div>
          </div>
        )}

        {isProAccount ? <ProAccountGrid /> : <PersonalAccountGrid />}
      </div>
    </AccountLayout>
  );
}

function PersonalAccountGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {personalSections.map((section) => <SectionCard key={section.title} section={section} />)}
    </div>
  );
}

function ProAccountGrid() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Commandes actives" value="14" />
        <Metric label="Revenus estimes" value="248 500 FCFA" />
        <Metric label="Messages non lus" value="8" />
      </div>
      <div>
        <h2 className="text-[22px] font-extrabold">Modules professionnels</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proSections.map((section) => <SectionCard key={section.title} section={section} featured />)}
        </div>
      </div>
      <div>
        <h2 className="text-[22px] font-extrabold">Raccourcis du compte</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {personalSections.slice(0, 6).map((section) => <SectionCard key={section.title} section={section} />)}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-2 text-[24px] font-extrabold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

function SectionCard({
  section,
  featured = false,
}: {
  section: { title: string; desc: string; to: string; icon: typeof ShoppingBag };
  featured?: boolean;
}) {
  const Icon = section.icon;
  return (
    <Link
      to={section.to as never}
      className={`group rounded-[8px] border bg-white p-5 transition hover:border-[var(--brand-primary)] ${
        featured ? "border-[var(--brand-primary)] shadow-iwosan-sm" : "border-[var(--brand-border-light)]"
      }`}
    >
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <h3 className="mt-4 text-[18px] font-bold">{section.title}</h3>
      <p className="mt-1 text-[13px] leading-6 text-[var(--color-text-muted)]">{section.desc}</p>
    </Link>
  );
}