import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  Home,
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
import { useAuth } from "@/lib/auth/AuthContext";

const navGroups = [
  {
    label: "Tableau de bord",
    links: [{ to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard }],
  },
  {
    label: "Site & apparence",
    links: [
      { to: "/admin/site/accueil", label: "Accueil", icon: Home },
      { to: "/admin/site/menus", label: "Menus", icon: Menu },
      { to: "/admin/site/pages", label: "Pages", icon: FileText },
      { to: "/admin/site/identite", label: "Identité", icon: Palette },
      { to: "/admin/site/publicites", label: "Publicités", icon: Bell },
    ],
  },
  {
    label: "Opérations",
    links: [
      { to: "/admin/contenus", label: "Contenus", icon: FileText },
      { to: "/admin/marketplace", label: "Marketplace", icon: Store },
      { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
      { to: "/admin/finances", label: "Finances", icon: CreditCard },
    ],
  },
  {
    label: "Communication",
    links: [
      { to: "/admin/communication", label: "Communication", icon: MessageSquare },
      { to: "/admin/communaute", label: "Communauté", icon: ShieldCheck },
      { to: "/admin/affiliation", label: "Affiliation", icon: BarChart3 },
      { to: "/admin/logs", label: "Logs", icon: FileText },
    ],
  },
];

export function AdminLayout({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const { roles, signOut } = useAuth();
  const adminState = roles.some((role) => ["super_admin", "admin", "moderator", "editor"].includes(role))
    ? "admin"
    : "forbidden";

  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const sidebar = (
    <aside className="flex h-full w-[270px] shrink-0 flex-col bg-[#151529] text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <div>
          <p className="text-[18px] font-black tracking-wide">IWOSAN</p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-300">Admin</p>
        </div>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fermer le menu admin">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">{group.label}</p>
            <div className="space-y-1">
              {group.links.map(({ to, label, icon: Icon }) => {
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
        ))}
      </nav>
    </aside>
  );

  return (
    <ProtectedRoute requireAnyRole={["super_admin", "admin", "moderator", "editor"]}>
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
          <button className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-label="Fermer" />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}
      <div className="flex min-h-screen">
        <div className="hidden lg:block">{sidebar}</div>
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a1a2e]/95 px-5 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-[26px] font-bold text-white">{title}</h1>
                {description && <p className="mt-1 text-[13px] text-slate-400">{description}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Link to="/" className="rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-white/80">
                  Voir le site
                </Link>
                <div className="hidden text-right sm:block">
                  <p className="text-[13px] font-bold">Admin Iwosan</p>
                  <p className="text-[11px] text-emerald-300">ADMIN</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15"
                  aria-label="Déconnexion"
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
                ? "Session admin active : accès autorisé aux outils de pilotage."
                : "Accès admin requis pour utiliser cette interface."}
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
