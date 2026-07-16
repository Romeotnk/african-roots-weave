import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  GraduationCap,
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
  { title: "Alertes", desc: "Recherches sauvegardees marketplace.", to: "/mon-compte/alertes", icon: BookOpen },
  { title: "Tickets", desc: "Conversations avec le support.", to: "/mon-compte/tickets", icon: HelpCircle },
  { title: "Parametres", desc: "Langue, securite et preferences.", to: "/mon-compte/parametres", icon: Settings },
];

const proSections = [
  { title: "Tableau de bord", desc: "Vue globale de votre activite professionnelle.", to: "/tableau-de-bord", icon: BriefcaseBusiness },
  { title: "Mes produits", desc: "Catalogue, stock, publications et moderation.", to: "/tableau-de-bord/mes-produits", icon: ShoppingBag },
  { title: "Commandes", desc: "Ventes, traitements et expeditions.", to: "/tableau-de-bord/commandes", icon: Package },
  { title: "Coupons", desc: "Codes promotionnels et campagnes.", to: "/tableau-de-bord/coupons", icon: Tag },
  { title: "Formations", desc: "Ressources, cours et publications.", to: "/tableau-de-bord/formations", icon: GraduationCap },
  { title: "Evenements", desc: "Agenda, salons, ateliers et inscriptions.", to: "/tableau-de-bord/evenements", icon: Calendar },
  { title: "Questions", desc: "Forum, reponses et expertise communautaire.", to: "/tableau-de-bord/questions", icon: MessageSquare },
  { title: "Avis", desc: "Avis recus et reponses publiques.", to: "/tableau-de-bord/avis", icon: Star },
  { title: "Reseau", desc: "Parrainage, reseau et commissions.", to: "/tableau-de-bord/reseau", icon: Users },
];

function AccountHome() {
  const { user, roles } = useAuth();
  const [showProPrompt, setShowProPrompt] = useState(true);
  const name = (user?.user_metadata?.first_name as string | undefined) || user?.email?.split("@")[0] || "Compte";
  const isProAccount = isProfessionalAccount(roles);
  const roleLabel = isProAccount ? "Espace professionnel" : "Espace utilisateur";

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className={`${isProAccount ? "bg-[var(--brand-primary)] text-white" : "bg-white"} border-b border-[var(--brand-border-light)]`}>
        <div className="container-iwosan py-8">
          <p className={`text-[12px] font-bold uppercase tracking-[0.14em] ${isProAccount ? "text-white/75" : "text-[var(--brand-primary)]"}`}>
            {roleLabel}
          </p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[32px] md:text-[42px]">Bonjour {name}</h1>
              <p className={`mt-2 max-w-2xl text-[14px] ${isProAccount ? "text-white/78" : "text-[var(--color-text-muted)]"}`}>
                {isProAccount
                  ? "Votre compte professionnel regroupe vos ventes, contenus, rendez-vous, avis et outils de croissance."
                  : "Votre compte personnel regroupe vos achats, messages, alertes, tickets et preferences."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isProAccount ? (
                <Link to="/tableau-de-bord" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[var(--brand-primary)]">
                  <BriefcaseBusiness size={17} /> Ouvrir le tableau de bord
                </Link>
              ) : (
                <Link to="/devenir-pro" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-bold text-white">
                  <Sparkles size={17} /> Devenir professionnel
                </Link>
              )}
              <Link to="/messages" className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-bold ${isProAccount ? "border border-white/30 text-white" : "border border-[var(--brand-border-light)] bg-white text-[var(--color-text-primary)]"}`}>
                <MessageSquare size={17} /> Messages
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-8">
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
                    Vous pouvez creer votre profil professionnel maintenant ou continuer avec votre compte utilisateur.
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
      </section>
    </main>
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