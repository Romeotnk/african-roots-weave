import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X, Leaf, Sun, Moon, LogOut, LogIn, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useTheme, type ThemeMode } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthContext";
import { getAccountHomePath, isProfessionalAccount, isStaffAccount } from "@/lib/auth/roles";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import type { SupportedLanguage } from "@/lib/i18n";

const parseMenuLinks = (value: string | undefined): { to: string; label: string }[] | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

function useMainLinks(t: (key: string) => string) {
  return [
    { to: "/", label: t("nav.home") },
    { to: "/marketplace", label: t("nav.marketplace") },
    { to: "/annuaire", label: t("nav.directory") },
    { to: "/pharmacopee", label: t("nav.pharmacopoeia") },
    { to: "/sante-au-quotidien", label: t("nav.dailyHealth") },
    { to: "/rites-cultures", label: t("nav.ritesCultures") },
    { to: "/recettes-sante", label: t("nav.healthRecipes") },
    { to: "/forum", label: t("nav.forum") },
    { to: "/agenda", label: t("nav.agenda") },
    { to: "/formations", label: t("nav.formations") },
    { to: "/aide", label: t("nav.helpCenter") },
    { to: "/contact", label: t("nav.contact") },
  ];
}

function useGroupedMobileLinks(t: (key: string) => string) {
  return [
    {
      label: t("nav.groupMain"),
      items: [
        { to: "/", label: t("nav.home") },
        { to: "/marketplace", label: t("nav.marketplace") },
        { to: "/annuaire", label: t("nav.directory") },
      ],
    },
    {
      label: t("nav.groupKnowledge"),
      items: [
        { to: "/pharmacopee", label: t("nav.pharmacopoeia") },
        { to: "/sante-au-quotidien", label: t("nav.dailyHealth") },
        { to: "/rites-cultures", label: t("nav.ritesCultures") },
        { to: "/recettes-sante", label: t("nav.healthRecipes") },
      ],
    },
    {
      label: t("nav.groupCommunity"),
      items: [
        { to: "/forum", label: t("nav.forum") },
        { to: "/agenda", label: t("nav.agenda") },
        { to: "/formations", label: t("nav.formations") },
      ],
    },
    {
      label: t("nav.groupOther"),
      items: [
        { to: "/aide", label: t("nav.helpCenter") },
        { to: "/contact", label: t("nav.contact") },
      ],
    },
  ];
}

function ThemeSwitch() {
  const { mode, setMode } = useTheme();
  const { t } = useTranslation();
  const items: { v: ThemeMode; icon: typeof Sun; label: string }[] = [
    { v: "light", icon: Sun, label: t("nav.lightMode") },
    { v: "dark", icon: Moon, label: t("nav.darkMode") },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-white/20 p-0.5 text-white/90">
      {items.map(({ v, icon: Icon, label }) => (
        <button
          key={v}
          role="radio"
          aria-checked={mode === v}
          onClick={() => setMode(v)}
          className={cn(
            "inline-flex h-7 items-center justify-center rounded-full px-2 text-[11px] transition",
            mode === v ? "bg-white text-[var(--brand-primary-dark)]" : "hover:bg-white/10",
          )}
          aria-label={label}
        >
          <Icon size={12} />
        </button>
      ))}
    </div>
  );
}

function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const options: SupportedLanguage[] = ["fr", "en"];
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-white/20 p-0.5 text-white/90" role="radiogroup" aria-label={t("nav.language")}>
      {options.map((lang) => (
        <button
          key={lang}
          type="button"
          role="radio"
          aria-checked={language === lang}
          onClick={() => setLanguage(lang)}
          className={cn(
            "inline-flex h-7 items-center justify-center rounded-full px-2 text-[11px] font-bold uppercase transition",
            language === lang ? "bg-white text-[var(--brand-primary-dark)]" : "hover:bg-white/10",
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isProAccount = isProfessionalAccount(roles);
  const accountHomePath = getAccountHomePath(roles);
  const accountHomeLabel = isStaffAccount(roles) ? t("nav.admin") : isProAccount ? t("nav.dashboard") : t("nav.myAccount");
  const mainLinks = useMainLinks(t);
  const groupedMobileLinks = useGroupedMobileLinks(t);

  const siteConfigQuery = useSiteConfig();
  const customHeaderLinks = useMemo(
    () => parseMenuLinks(siteConfigQuery.data?.data?.["site.menus.header"]),
    [siteConfigQuery.data],
  );
  const navLinks = customHeaderLinks ?? mainLinks;
  const siteName = siteConfigQuery.data?.data?.["site.name"] || "IWOSAN";
  const siteTagline = siteConfigQuery.data?.data?.["site.tagline"] || (siteConfigQuery.isLoading ? "" : t("nav.defaultTagline"));
  const logoUrl = siteConfigQuery.data?.data?.["site.logoUrl"];

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const logout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const linkClass = (to: string) => cn(
    "inline-flex items-center border-b-3 px-1 py-4 text-[12px] font-semibold transition",
    pathname === to
      ? "border-[var(--brand-gold)] text-white"
      : "border-transparent text-white/85 hover:text-white hover:border-white/25",
  );

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[var(--brand-primary-dark)] text-white">
        <div className="container-iwosan flex h-14 items-center justify-between gap-4 text-white">
          <Link to="/" className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white">
                <Leaf size={18} />
              </div>
            )}
            <div className="leading-tight">
              <div className="text-[18px] font-extrabold tracking-[0.14em]">{siteName}</div>
              <div className="hidden text-[11px] text-white/75 sm:block">{siteTagline}</div>
            </div>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitch />
            <ThemeSwitch />
            {user ? (
              <>
                <Link to={accountHomePath} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[12px] font-semibold hover:bg-white/10">
                  <LogOut size={14} /> {accountHomeLabel}
                </Link>
                <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[12px] font-semibold hover:bg-white/10">
                  <LogOut size={14} /> {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold hover:bg-white/10">
                  <LogIn size={14} /> {t("nav.login")}
                </Link>
                <Link to="/inscription" className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-gold)] px-4 py-2 text-[12px] font-semibold text-white">
                  <UserPlus size={14} /> {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-b-[3px] border-[var(--brand-gold)] bg-[var(--brand-primary)] text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <div className="container-iwosan flex min-h-14 items-center justify-between gap-4 py-1">
          <nav className="hidden flex-wrap items-center gap-x-3 gap-y-1 lg:flex">
            {navLinks.map((link, idx) => {
              const showSeparator = customHeaderLinks ? idx > 0 : idx > 0 && idx !== 3 && idx !== 7 && idx !== 10;
              return (
                <span key={link.to} className="flex items-center gap-3">
                  {showSeparator && <span className="h-5 w-px bg-white/12" />}
                  <Link to={link.to} className={linkClass(link.to)}>{link.label}</Link>
                </span>
              );
            })}
          </nav>
          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-white lg:hidden"
            onClick={() => setOpen(true)}
            aria-label={t("nav.openMenu")}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <div className={cn("fixed inset-0 z-[100] lg:hidden transition-opacity", open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}>
        <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
        <aside className={cn("absolute right-0 top-0 h-full w-[88vw] max-w-sm bg-[var(--brand-primary)] text-white shadow-2xl transition-transform", open ? "translate-x-0" : "translate-x-full")}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <div className="text-[18px] font-extrabold tracking-[0.14em]">{siteName}</div>
              <div className="text-[11px] text-white/70">{siteTagline}</div>
            </div>
            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
              <X size={22} />
            </button>
          </div>
          <div className="h-[calc(100%-64px)] overflow-y-auto px-5 py-5">
            <div className="space-y-5">
              {customHeaderLinks ? (
                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">{t("nav.menu")}</p>
                  <div className="space-y-2">
                    {customHeaderLinks.map((item) => (
                      <Link key={item.to} to={item.to} className="block rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-[14px] font-semibold" onClick={() => setOpen(false)}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                groupedMobileLinks.map((group) => (
                  <div key={group.label}>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">{group.label}</p>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <Link key={item.to} to={item.to} className="block rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-[14px] font-semibold" onClick={() => setOpen(false)}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 flex items-center justify-center gap-3 border-t border-white/10 pt-5">
              <LanguageSwitch />
              <ThemeSwitch />
            </div>
            <div className="mt-4 space-y-3">
              {user ? (
                <>
                  <Link to={accountHomePath} className="block w-full rounded-full border border-white/15 px-4 py-3 text-center font-semibold" onClick={() => setOpen(false)}>{accountHomeLabel}</Link>
                  <button onClick={logout} className="w-full rounded-full bg-white px-4 py-3 font-semibold text-[var(--brand-primary-dark)]">{t("nav.logout")}</button>
                </>
              ) : (
                <>
                  <Link to="/connexion" className="block w-full rounded-full border border-white/15 px-4 py-3 text-center font-semibold" onClick={() => setOpen(false)}>{t("nav.login")}</Link>
                  <Link to="/inscription" className="block w-full rounded-full bg-[var(--brand-gold)] px-4 py-3 text-center font-semibold text-white" onClick={() => setOpen(false)}>{t("nav.register")}</Link>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
