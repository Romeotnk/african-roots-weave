import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  FileText,
  GraduationCap,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth/AuthContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard professionnel - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <ProfessionalHome />
    </ProtectedRoute>
  ),
});

const proSections = [
  { title: "Vue praticien", desc: "Consultations, avis et statistiques.", to: "/dashboard/pro", icon: Star },
  { title: "Mes produits", desc: "Catalogue, stock et validation.", to: "/tableau-de-bord/mes-produits", icon: ShoppingBag },
  { title: "Commandes", desc: "Suivi des ventes et traitements.", to: "/tableau-de-bord/commandes", icon: Package },
  { title: "Revenus", desc: "Portefeuille, escrow et transactions.", to: "/mon-compte/portefeuille", icon: Wallet },
  { title: "Coupons", desc: "Codes promo et campagnes.", to: "/tableau-de-bord/coupons", icon: Tag },
  { title: "Mon blog", desc: "Articles sante et recettes.", to: "/tableau-de-bord/blog", icon: FileText },
  { title: "Questions", desc: "Forum et reponses communautaires.", to: "/tableau-de-bord/questions", icon: MessageSquare },
  { title: "Formations", desc: "Documents et ressources.", to: "/tableau-de-bord/formations", icon: GraduationCap },
  { title: "Evenements", desc: "Agenda, inscriptions et salons.", to: "/tableau-de-bord/evenements", icon: Calendar },
  { title: "Reseau", desc: "Affiliation et downline.", to: "/tableau-de-bord/reseau", icon: Users },
];

function ProfessionalHome() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.first_name as string | undefined) || user?.email?.split("@")[0] || "professionnel";

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
            Espace professionnel
          </p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            Bonjour {name}. Votre espace regroupe vos ventes, contenus, evenements et revenus.
          </p>
        </div>
      </section>

      <section className="container-iwosan py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                to={section.to as never}
                className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5 transition hover:border-[var(--brand-primary)]"
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
