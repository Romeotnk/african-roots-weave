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
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Reveal, staggerDelay } from "@/components/shared/Reveal";
import { useAuth } from "@/lib/auth/AuthContext";
import { isProfessionalAccount, isStaffAccount, USER_ACCOUNT_ROLES } from "@/lib/auth/roles";
import { useMyBookings } from "@/hooks/useBookingsApi";
import { useMyOrders } from "@/hooks/useOrdersApi";
import { listConversations } from "@/lib/api/messages";

export const Route = createFileRoute("/mon-compte/")({
  head: () => ({ meta: [{ title: "Mon compte - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={USER_ACCOUNT_ROLES}>
      <AccountHome />
    </ProtectedRoute>
  ),
});

function buildPersonalSections(t: TFunction) {
  return [
    { id: "orders", title: t("accountHome.personal.ordersTitle"), desc: t("accountHome.personal.ordersDesc"), to: "/mes-commandes", icon: ShoppingBag },
    { id: "messages", title: t("accountHome.personal.messagesTitle"), desc: t("accountHome.personal.messagesDesc"), to: "/messages", icon: MessageSquare },
    { id: "wallet", title: t("accountHome.personal.walletTitle"), desc: t("accountHome.personal.walletDesc"), to: "/mon-compte/portefeuille", icon: Wallet },
    { id: "profile", title: t("accountHome.personal.profileTitle"), desc: t("accountHome.personal.profileDesc"), to: "/mon-compte/profil", icon: User },
    { id: "registrations", title: t("accountHome.personal.registrationsTitle"), desc: t("accountHome.personal.registrationsDesc"), to: "/mon-compte/inscriptions", icon: Calendar },
    { id: "questions", title: t("accountHome.personal.questionsTitle"), desc: t("accountHome.personal.questionsDesc"), to: "/mon-compte/questions", icon: MessageSquare },
    { id: "kyc", title: t("accountHome.personal.kycTitle"), desc: t("accountHome.personal.kycDesc"), to: "/mon-compte/kyc", icon: ShieldCheck },
    { id: "notifications", title: t("accountHome.personal.notificationsTitle"), desc: t("accountHome.personal.notificationsDesc"), to: "/mon-compte/notifications", icon: Bell },
    { id: "bookings", title: t("accountHome.personal.bookingsTitle"), desc: t("accountHome.personal.bookingsDesc"), to: "/mon-compte/reservations", icon: Calendar },
    { id: "quotes", title: t("accountHome.personal.quotesTitle"), desc: t("accountHome.personal.quotesDesc"), to: "/mon-compte/devis", icon: FileText },
    { id: "alerts", title: t("accountHome.personal.alertsTitle"), desc: t("accountHome.personal.alertsDesc"), to: "/mon-compte/alertes", icon: BookOpen },
    { id: "favorites", title: t("accountHome.personal.favoritesTitle"), desc: t("accountHome.personal.favoritesDesc"), to: "/mon-compte/favoris", icon: Sparkles },
    { id: "affiliation", title: t("accountHome.personal.affiliationTitle"), desc: t("accountHome.personal.affiliationDesc"), to: "/mon-compte/affiliation", icon: Users },
    { id: "tickets", title: t("accountHome.personal.ticketsTitle"), desc: t("accountHome.personal.ticketsDesc"), to: "/mon-compte/tickets", icon: HelpCircle },
    { id: "settings", title: t("accountHome.personal.settingsTitle"), desc: t("accountHome.personal.settingsDesc"), to: "/mon-compte/parametres", icon: Settings },
  ];
}

// commercialOnly: tied to running an actual storefront (sales, bookings as a
// provider, subscription, MLM earnings) — hidden for admin/super_admin, who
// have professional-tier *permissions* but aren't merchants. Content/support
// tools legitimately shared with staff (formations, evenements, questions,
// support) stay visible to everyone in the pro tier.
function buildProSections(t: TFunction) {
  return [
    { id: "dashboard", title: t("accountHome.pro.dashboardTitle"), desc: t("accountHome.pro.dashboardDesc"), to: "/tableau-de-bord", icon: BriefcaseBusiness },
    { id: "myProducts", title: t("accountHome.pro.myProductsTitle"), desc: t("accountHome.pro.myProductsDesc"), to: "/tableau-de-bord/mes-produits", icon: ShoppingBag, commercialOnly: true },
    { id: "orders", title: t("accountHome.pro.ordersTitle"), desc: t("accountHome.pro.ordersDesc"), to: "/tableau-de-bord/commandes", icon: Package, commercialOnly: true },
    { id: "bookings", title: t("accountHome.pro.bookingsTitle"), desc: t("accountHome.pro.bookingsDesc"), to: "/tableau-de-bord/reservations", icon: Calendar, commercialOnly: true },
    { id: "quotes", title: t("accountHome.pro.quotesTitle"), desc: t("accountHome.pro.quotesDesc"), to: "/tableau-de-bord/devis", icon: FileText, commercialOnly: true },
    { id: "coupons", title: t("accountHome.pro.couponsTitle"), desc: t("accountHome.pro.couponsDesc"), to: "/tableau-de-bord/coupons", icon: Tag, commercialOnly: true },
    { id: "subscription", title: t("accountHome.pro.subscriptionTitle"), desc: t("accountHome.pro.subscriptionDesc"), to: "/tableau-de-bord/abonnement", icon: Layers, commercialOnly: true },
    { id: "formations", title: t("accountHome.pro.formationsTitle"), desc: t("accountHome.pro.formationsDesc"), to: "/tableau-de-bord/formations", icon: GraduationCap },
    { id: "events", title: t("accountHome.pro.eventsTitle"), desc: t("accountHome.pro.eventsDesc"), to: "/tableau-de-bord/evenements", icon: Calendar },
    { id: "questions", title: t("accountHome.pro.questionsTitle"), desc: t("accountHome.pro.questionsDesc"), to: "/tableau-de-bord/questions", icon: MessageSquare },
    { id: "reviews", title: t("accountHome.pro.reviewsTitle"), desc: t("accountHome.pro.reviewsDesc"), to: "/tableau-de-bord/avis", icon: Star, commercialOnly: true },
    { id: "support", title: t("accountHome.pro.supportTitle"), desc: t("accountHome.pro.supportDesc"), to: "/tableau-de-bord/support", icon: HelpCircle },
    { id: "mlmNetwork", title: t("accountHome.pro.mlmNetworkTitle"), desc: t("accountHome.pro.mlmNetworkDesc"), to: "/tableau-de-bord/reseau", icon: Users, commercialOnly: true },
    { id: "affiliation", title: t("accountHome.pro.affiliationTitle"), desc: t("accountHome.pro.affiliationDesc"), to: "/tableau-de-bord/affiliation", icon: Link2, commercialOnly: true },
  ];
}

function AccountHome() {
  const { t } = useTranslation();
  const { user, roles } = useAuth();
  const { data: bookings } = useMyBookings("client");
  const upcomingBookings = (bookings ?? [])
    .filter((booking) => booking.status === "PENDING" || booking.status === "CONFIRMED")
    .slice(0, 3);
  const [showProPrompt, setShowProPrompt] = useState(true);
  const name = (user?.user_metadata?.first_name as string | undefined) || user?.email?.split("@")[0] || t("accountHome.defaultAccountLabel");
  const isProAccount = isProfessionalAccount(roles);
  const isCommercial = isProAccount && !isStaffAccount(roles);

  return (
    <AccountLayout
      title={t("accountHome.greeting", { name })}
      description={
        isProAccount
          ? t("accountHome.proDescription")
          : t("accountHome.personalDescription")
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {isProAccount ? (
          <Link to="/tableau-de-bord" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-bold text-white">
            <BriefcaseBusiness size={17} /> {t("accountHome.openDashboard")}
          </Link>
        ) : (
          <Link to="/devenir-pro" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-bold text-white">
            <Sparkles size={17} /> {t("accountHome.becomeProfessional")}
          </Link>
        )}
        <Link to="/messages" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--brand-border-light)] bg-white px-5 text-[14px] font-bold text-[var(--color-text-primary)]">
          <MessageSquare size={17} /> {t("accountHome.messages")}
        </Link>
      </div>

      <div>
        {upcomingBookings.length > 0 && (
          <div className="mb-8 grid gap-4 rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 shadow-iwosan-md lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">{t("accountHome.bookingsEyebrow")}</p>
              <h2 className="mt-2 text-[24px] font-extrabold">{t("accountHome.upcomingBookingsTitle")}</h2>
              <p className="mt-2 text-[14px] leading-7 text-[var(--color-text-muted)]">{t("accountHome.upcomingBookingsDesc")}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="rounded-[18px] bg-[var(--brand-surface-alt)] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
                    {booking.status === "PENDING" ? t("accountHome.bookingPending") : t("accountHome.bookingConfirmed")}
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
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">{t("accountHome.proPromptEyebrow")}</p>
                  <h2 className="mt-1 text-[20px] font-extrabold">{t("accountHome.proPromptTitle")}</h2>
                  <p className="mt-1 text-[13px] leading-6 text-[var(--color-text-muted)]">
                    {t("accountHome.proPromptDesc")}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link to="/devenir-pro" className="btn-primary h-10 px-4 text-[13px]">{t("accountHome.doItNow")}</Link>
                <button type="button" onClick={() => setShowProPrompt(false)} className="btn-secondary h-10 px-4 text-[13px]">
                  {t("accountHome.later")}
                </button>
                <button type="button" onClick={() => setShowProPrompt(false)} aria-label={t("accountHome.close")} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border-light)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                  <X size={17} />
                </button>
              </div>
            </div>
          </div>
        )}

        {isProAccount ? <ProAccountGrid isCommercial={isCommercial} /> : <PersonalAccountGrid />}
      </div>
    </AccountLayout>
  );
}

function PersonalAccountGrid() {
  const { t } = useTranslation();
  const personalSections = buildPersonalSections(t);
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {personalSections.map((section, index) => (
        <Reveal key={section.id} delayMs={staggerDelay(index % 12, 40, 280)}>
          <SectionCard section={section} />
        </Reveal>
      ))}
    </div>
  );
}

type BackendOrder = { totalAmount: string | number; status: string; createdAt: string };

function ProAccountGrid({ isCommercial }: { isCommercial: boolean }) {
  const { t } = useTranslation();
  const proSections = buildProSections(t);
  const personalSections = buildPersonalSections(t);
  const ordersQuery = useMyOrders("seller");
  const conversationsQuery = useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: listConversations,
    retry: false,
  });

  const orders = (ordersQuery.data?.data ?? []) as BackendOrder[];
  const conversations = conversationsQuery.data ?? [];

  const monthlyRevenue = (() => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return orders
      .filter((order) => new Date(order.createdAt) >= startOfMonth && !["CANCELLED", "REFUNDED"].includes(order.status))
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);
  })();
  const activeOrdersCount = orders.filter((order) => !["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)).length;
  const unreadMessagesCount = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);
  const isLoading = ordersQuery.isLoading || conversationsQuery.isLoading;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label={t("accountHome.activeOrders")} value={isLoading ? "-" : String(activeOrdersCount)} />
        <Metric label={t("accountHome.monthlyRevenue")} value={isLoading ? "-" : `${monthlyRevenue.toLocaleString("fr-FR")} FCFA`} />
        <Metric label={t("accountHome.unreadMessages")} value={isLoading ? "-" : String(unreadMessagesCount)} />
      </div>
      <div>
        <h2 className="text-[22px] font-extrabold">{t("accountHome.proModules")}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proSections.filter((section) => !section.commercialOnly || isCommercial).map((section, index) => (
            <Reveal key={section.id} delayMs={staggerDelay(index % 12, 40, 280)}>
              <SectionCard section={section} featured />
            </Reveal>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-[22px] font-extrabold">{t("accountHome.accountShortcuts")}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {personalSections.slice(0, 6).map((section, index) => (
            <Reveal key={section.id} delayMs={staggerDelay(index % 12, 40, 280)}>
              <SectionCard section={section} />
            </Reveal>
          ))}
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
      className={`group rounded-[8px] border bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:shadow-iwosan-md ${
        featured ? "border-[var(--brand-primary)] shadow-iwosan-sm" : "border-[var(--brand-border-light)]"
      }`}
    >
      <div className="inline-flex rounded-lg bg-[var(--brand-primary-subtle)] p-2.5 transition group-hover:bg-[var(--brand-primary)]">
        <Icon size={20} className="text-[var(--brand-primary)] transition group-hover:text-white" />
      </div>
      <h3 className="mt-4 text-[18px] font-bold">{section.title}</h3>
      <p className="mt-1 text-[13px] leading-6 text-[var(--color-text-muted)]">{section.desc}</p>
    </Link>
  );
}