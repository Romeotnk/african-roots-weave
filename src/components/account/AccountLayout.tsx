import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Bell, Leaf, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { isProfessionalAccount, isStaffAccount } from "@/lib/auth/roles";
import { useMeQuery } from "@/hooks/useAuthApi";
import { buildAccountNavGroups } from "@/lib/accountNav";

// Shared shell for the whole account area (/mon-compte/* and /tableau-de-bord/*):
// a persistent sidebar (same visual design across both spaces, content just
// varies by role) plus a header carrying the page title. Each page supplies
// its own title/description/content; navigation and role filtering live here
// once instead of being re-implemented per page.
export function AccountLayout({
  title,
  description,
  actions,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const { user, roles, signOut } = useAuth();
  const { data: profile } = useMeQuery();

  useEffect(() => setOpen(false), [pathname]);

  const isPro = isProfessionalAccount(roles);
  const isStaff = isStaffAccount(roles);
  // Commerce-only tiles (storefront, sales, KYC self-submission) are for
  // real merchants, not staff wearing professional-tier permissions.
  const isCommercial = isPro && !isStaff;
  const displayName =
    `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() ||
    (user?.user_metadata?.first_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    t("accountLayout.defaultDisplayName");
  const roleLabel = roles.includes("super_admin")
    ? t("accountLayout.roleSuperAdmin")
    : roles.includes("admin")
      ? t("accountLayout.roleAdmin")
      : isPro
        ? t("accountLayout.roleProfessional")
        : t("accountLayout.roleUser");

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const accountNavGroups = buildAccountNavGroups(t);
  const groups = accountNavGroups.filter((group) => (!group.proOnly || isPro) && (!group.commercialOnly || isCommercial))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => (!item.proOnly || isPro) && (!item.hideForPro || !isPro) && (!item.commercialOnly || isCommercial),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const hubPath = pathname.startsWith("/tableau-de-bord") ? "/tableau-de-bord" : "/mon-compte";
  const isHubPage = pathname === hubPath;

  const sidebar = (
    <aside className="sticky top-0 flex h-screen w-[270px] shrink-0 flex-col overflow-y-auto border-r border-[var(--brand-border-light)] bg-white">
      <Link to="/" className="flex h-[72px] shrink-0 items-center gap-2 border-b border-[var(--brand-border-light)] px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[var(--brand-primary)] text-white">
          <Leaf size={18} />
        </div>
        <span className="text-[20px] font-extrabold text-[var(--brand-primary)]">IWOSAN</span>
      </Link>
      <div className="flex items-center gap-3 border-b border-[var(--brand-border-light)] p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary-subtle)] text-[14px] font-bold text-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/15">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{displayName}</p>
          <span className="rounded bg-[var(--brand-gold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {roleLabel}
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-5 p-3">
        {groups.map((group) => (
          <div key={group.id}>
            <h4 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
              {group.title}
            </h4>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = Boolean(item.to) && (pathname === item.to || pathname.startsWith(`${item.to}/`));
                const className = cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14px] transition active:scale-[0.98]",
                  active
                    ? "bg-[var(--brand-primary-subtle)] font-semibold text-[var(--brand-primary)]"
                    : item.isLogout
                      ? "text-red-600 hover:bg-red-50"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--brand-surface-alt)]",
                );
                return (
                  <li key={item.id} className="relative">
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[var(--brand-primary)]" />
                    )}
                    {item.isLogout ? (
                      <button type="button" onClick={handleLogout} className={className}>
                        <item.icon size={16} /> {item.label}
                      </button>
                    ) : (
                      <Link to={item.to as never} className={className}>
                        <item.icon size={16} /> {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[var(--brand-bg)]">
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-[90] grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-primary)] text-white shadow-iwosan-md"
          aria-expanded={open}
          aria-controls="account-mobile-menu"
          aria-label={t("accountLayout.openAccountMenu")}
        >
          <Menu size={20} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden" id="account-mobile-menu">
          <button className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label={t("accountLayout.closeMenu")} />
          <div className="relative h-full">
            {sidebar}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[var(--brand-surface-alt)]"
              aria-label={t("accountLayout.closeMenu")}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="hidden lg:block">{sidebar}</div>

      <div className="min-w-0 flex-1">
        {(title || description) && (
          <header className="border-b border-[var(--brand-border-light)] bg-white px-5 py-6 md:px-8">
            {!isHubPage && (
              <Link
                to={hubPath}
                className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--brand-primary)]"
              >
                <ArrowLeft size={15} /> {t("accountLayout.back")}
              </Link>
            )}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div key={title} className="hero-fade-up">
                {title && <h1 className="text-[26px] font-bold md:text-[32px]">{title}</h1>}
                {description && <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">{description}</p>}
              </div>
              <div className="flex items-center gap-2">
                {actions}
                <Link
                  to="/mon-compte/notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--brand-surface-alt)]"
                  aria-label={t("accountLayout.notifications")}
                >
                  <Bell size={18} />
                </Link>
              </div>
            </div>
          </header>
        )}
        <div className="p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}
