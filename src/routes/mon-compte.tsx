import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Calendar,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Star,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth/AuthContext";

export const Route = createFileRoute("/mon-compte")({
  head: () => ({ meta: [{ title: "Mon compte - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["user", "researcher", "professional", "admin", "super_admin"]}>
      <AccountHome />
    </ProtectedRoute>
  ),
});

const sections = [
  { title: "Mes commandes", desc: "Achats, remboursements et suivi.", to: "/tableau-de-bord/commandes", icon: ShoppingBag },
  { title: "Portefeuille", desc: "Solde, transactions et retraits.", to: "/mon-compte/portefeuille", icon: Wallet },
  { title: "Mon profil", desc: "Identite, preferences et informations.", to: "/tableau-de-bord/profil", icon: User },
  { title: "KYC", desc: "Verification d'identite et statut.", to: "/mon-compte/kyc", icon: ShieldCheck },
  { title: "Notifications", desc: "Messages, commandes et alertes.", to: "/mon-compte/notifications", icon: Bell },
  { title: "Affiliation", desc: "Lien de parrainage et commissions.", to: "/mon-compte/affiliation", icon: Users },
  { title: "Mes questions", desc: "Forum, reponses et votes.", to: "/tableau-de-bord/questions", icon: MessageSquare },
  { title: "Mes formations", desc: "Bibliotheque et telechargements.", to: "/tableau-de-bord/formations", icon: GraduationCap },
  { title: "Mes evenements", desc: "Inscriptions et agenda.", to: "/tableau-de-bord/evenements", icon: Calendar },
  { title: "Avis", desc: "Avis donnes ou recus selon le role.", to: "/tableau-de-bord/avis", icon: Star },
  { title: "Alertes", desc: "Recherches sauvegardees marketplace.", to: "/mon-compte/alertes", icon: BookOpen },
  { title: "Tickets", desc: "Conversations avec le support.", to: "/mon-compte/tickets", icon: HelpCircle },
];

function AccountHome() {
  const { user, roles } = useAuth();
  const name = (user?.user_metadata?.first_name as string | undefined) || user?.email?.split("@")[0] || "Compte";
  const roleLabel = roles.includes("researcher")
    ? "Chercheur"
    : roles.includes("professional")
      ? "Professionnel"
      : roles.includes("admin") || roles.includes("super_admin")
        ? "Administration"
        : "Utilisateur";

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
            {roleLabel}
          </p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Mon compte</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            Bonjour {name}. Toutes les sections ci-dessous chargent les donnees liees a votre compte connecte.
          </p>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                to={section.to as never}
                className="group rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5 transition hover:border-[var(--brand-primary)]"
              >
                <Icon size={22} className="text-[var(--brand-primary)]" />
                <h2 className="mt-4 text-[18px] font-bold">{section.title}</h2>
                <p className="mt-1 text-[13px] leading-6 text-[var(--color-text-muted)]">{section.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
