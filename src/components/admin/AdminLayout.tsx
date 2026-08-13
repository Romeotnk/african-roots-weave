import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  Home,
  KeyRound,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Palette,
  ShieldCheck,
  Store,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth, type AppRole } from "@/lib/auth/AuthContext";
import { Reveal, staggerDelay } from "@/components/shared/Reveal";

type NavLink = { to: string; label: string; icon: typeof LayoutDashboard; roles?: AppRole[] };
type NavGroup = { label: string; roles?: AppRole[]; links: NavLink[] };

// `roles` restricts a link to the roles listed (lowercase, matching useAuth().roles).
// Omitting `roles` means "visible to any admin-panel role". Kept in sync with the
// backend's own checkRole() gates so the menu never promises an action a role
// can't actually perform.
function buildNavGroups(t: TFunction): NavGroup[] {
  return [
    {
      label: t("admin.layout.navDashboard"),
      links: [{ to: "/admin", label: t("admin.layout.navOverview"), icon: LayoutDashboard }],
    },
    {
      // No group-level role restriction: unlike Accueil/Menus/Identité/
      // Publicités/Rôles & permissions (gated by "system.config", SUPER_ADMIN
      // only), the backend grants "content.pages.manage" to ADMIN too — so
      // Pages needs its own, broader roles list rather than inheriting the
      // group's super_admin-only gate.
      label: t("admin.layout.navSiteAppearance"),
      links: [
        { to: "/admin/site/accueil", label: t("admin.layout.navHome"), icon: Home, roles: ["super_admin"] },
        { to: "/admin/site/menus", label: t("admin.layout.navMenus"), icon: Menu, roles: ["super_admin"] },
        { to: "/admin/site/pages", label: t("admin.layout.navPages"), icon: FileText, roles: ["super_admin", "admin"] },
        { to: "/admin/site/textes", label: t("admin.layout.navSiteTexts"), icon: Languages, roles: ["super_admin"] },
        { to: "/admin/site/identite", label: t("admin.layout.navIdentity"), icon: Palette, roles: ["super_admin"] },
        { to: "/admin/site/publicites", label: t("admin.layout.navAds"), icon: Bell, roles: ["super_admin"] },
        { to: "/admin/roles-permissions", label: t("admin.layout.navRolesPermissions"), icon: KeyRound, roles: ["super_admin"] },
      ],
    },
    {
      label: t("admin.layout.navOperations"),
      links: [
        { to: "/admin/contenus", label: t("admin.layout.navContent"), icon: FileText, roles: ["super_admin", "admin"] },
        { to: "/admin/marketplace", label: t("admin.layout.navMarketplace"), icon: Store, roles: ["super_admin", "admin"] },
        { to: "/admin/utilisateurs", label: t("admin.layout.navUsers"), icon: Users, roles: ["super_admin", "admin"] },
        { to: "/admin/utilisateurs/kyc", label: t("admin.layout.navKycQueue"), icon: ShieldCheck, roles: ["super_admin", "admin"] },
        { to: "/admin/finances", label: t("admin.layout.navFinances"), icon: CreditCard, roles: ["super_admin", "admin"] },
      ],
    },
    {
      label: t("admin.layout.navCommunication"),
      links: [
        { to: "/admin/communication", label: t("admin.layout.navCommunication"), icon: MessageSquare },
        { to: "/admin/communaute", label: t("admin.layout.navCommunity"), icon: ShieldCheck, roles: ["super_admin", "admin"] },
        { to: "/admin/affiliation", label: t("admin.layout.navAffiliation"), icon: BarChart3, roles: ["super_admin", "admin"] },
        { to: "/admin/logs", label: t("admin.layout.navLogs"), icon: FileText, roles: ["super_admin"] },
      ],
    },
  ];
}

export function AdminLayout({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const { t } = useTranslation();
  const navGroups = buildNavGroups(t);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const { roles, signOut, user } = useAuth();
  const adminState = roles.some((role) => ["super_admin", "admin"].includes(role))
    ? "admin"
    : "forbidden";

  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const sidebar = (
    <aside className="sticky top-0 flex h-screen w-[270px] shrink-0 flex-col bg-[#151529] text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <div>
          <p className="text-[18px] font-black tracking-wide">IWOSAN</p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-300">{t("admin.layout.adminBadge")}</p>
        </div>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label={t("admin.layout.closeAdminMenu")}>
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups
          .filter((group) => !group.roles || group.roles.some((role) => roles.includes(role)))
          .map((group) => {
            const links = group.links.filter((link) => !link.roles || link.roles.some((role) => roles.includes(role)));
            if (links.length === 0) return null;
            return (
              <div key={group.label} className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">{group.label}</p>
                <div className="space-y-1">
                  {links.map(({ to, label, icon: Icon }) => {
                    const active = pathname === to || (to !== "/admin" && pathname.startsWith(to));
                    return (
                      <Link
                        key={to}
                        to={to}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition",
                          active ? "bg-emerald-500 text-[#111827]" : "text-white/75 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon size={16} /> {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </nav>
    </aside>
  );

  return (
    <ProtectedRoute requireAnyRole={["super_admin", "admin"]}>
    <main className="min-h-screen bg-[#0f1020] text-slate-100">
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-[90] grid h-11 w-11 place-items-center rounded-full bg-emerald-500 text-[#111827]"
          aria-expanded={open}
          aria-controls="admin-mobile-menu"
        >
          <Menu size={20} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden" id="admin-mobile-menu">
          <button className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-label={t("admin.layout.close")} />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}
      <div className="flex min-h-screen">
        <div className="hidden lg:block">{sidebar}</div>
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a1a2e]/95 px-5 py-4 backdrop-blur">
            {pathname !== "/admin" && (
              <Link
                to="/admin"
                className="mb-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/60 transition hover:text-white"
              >
                <ArrowLeft size={15} /> {t("admin.layout.back")}
              </Link>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div key={title} className="hero-fade-up">
                <h1 className="text-[26px] font-bold text-white">{title}</h1>
                {description && <p className="mt-1 text-[13px] text-slate-400">{description}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Link to="/" className="rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-white/80">
                  {t("admin.layout.viewSite")}
                </Link>
                <div className="hidden text-right sm:block">
                  <p className="text-[13px] font-bold">{user?.email ?? t("admin.layout.defaultAdminName")}</p>
                  <p className="text-[11px] text-emerald-300">{roles[0]?.toUpperCase().replaceAll("_", " ") ?? "ADMIN"}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15"
                  aria-label={t("admin.layout.logout")}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </header>
          <div className="p-4 md:p-6">
            <div
              className={cn(
                "mb-4 rounded-lg border px-4 py-3 text-[13px] font-semibold",
                adminState === "admin" && "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
                adminState === "forbidden" && "border-red-400/30 bg-red-500/10 text-red-100",
              )}
            >
              {adminState === "admin"
                ? t("admin.layout.adminSessionActive")
                : t("admin.layout.adminAccessRequired")}
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
}

export function AdminCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-[12px] border border-white/10 bg-white/[0.04] p-5 shadow-xl", className)}>{children}</div>;
}

export function AdminHubPage({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links: { to: string; label: string; description: string }[];
}) {
  return (
    <AdminLayout title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link, index) => (
          <Reveal key={link.to} delayMs={staggerDelay(index % 8, 45, 320)}>
            <Link to={link.to} className="block rounded-[12px] border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.07]">
              <p className="text-[16px] font-bold text-white">{link.label}</p>
              <p className="mt-2 text-[13px] text-slate-400">{link.description}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </AdminLayout>
  );
}

export function AdminTable({ headers, rows }: { headers: string[]; rows: (string | number | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-white/10">
      <table className="w-full min-w-[760px] text-left text-[13px]">
        <thead className="bg-white/10 text-slate-300">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-white/10">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 text-slate-200">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
