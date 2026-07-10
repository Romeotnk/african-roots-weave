import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X, Leaf, ChevronDown, Sun, Moon, LogIn, UserPlus, LogOut, LayoutDashboard, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme, type ThemeMode } from "@/components/ThemeProvider";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCart } from "@/cart/CartContext";
import { NotificationBell } from "@/components/layout/NotificationBell";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/annuaire", label: "Annuaire" },
  { to: "/pharmacopee", label: "Pharmacopée" },
];
const communityLinks = [
  { to: "/discutons-en", label: "Discutons-en" },
  { to: "/sante-quotidien", label: "Blog" },
  { to: "/rites-cultures", label: "Rites & Cultures" },
  { to: "/recettes-sante", label: "Recettes santé" },
];
const tailLinks = [
  { to: "/agenda", label: "Agenda" },
  { to: "/formations", label: "Formations" },
];
const accountLinks = [
  { to: "/panier", label: "Panier" },
  { to: "/messages", label: "Messages" },
  { to: "/mes-commandes", label: "Mes commandes" },
  { to: "/mon-compte/portefeuille", label: "Portefeuille" },
  { to: "/mon-compte/affiliation", label: "Affiliation" },
  { to: "/mon-compte/kyc", label: "KYC" },
  { to: "/mon-compte/alertes", label: "Alertes" },
  { to: "/mon-compte/tickets", label: "Tickets" },
];

const displayLabels = {
  community: "Communaut\u00e9",
  logout: "D\u00e9connexion",
};

function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const { mode, setMode, resolved } = useTheme();
  const items: { v: ThemeMode; icon: typeof Sun; label: string }[] = [
    { v: "light", icon: Sun, label: "Clair" },
    { v: "dark", icon: Moon, label: "Sombre" },
  ];
  if (compact) {
    // Single toggle button used in mobile header
    const Icon = resolved === "dark" ? Sun : Moon;
    return (
      <button
        onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
        aria-label="Changer le thème"
        className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--brand-border)] text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] active:scale-95 transition"
      >
        <Icon size={18} />
      </button>
    );
  }
  return (
    <div
      className="flex items-center gap-0.5 border border-[var(--brand-border)] rounded-full p-0.5"
      role="radiogroup"
      aria-label="Thème"
    >
      {items.map(({ v, icon: Icon, label }) => (
        <button
          key={v}
          role="radio"
          aria-checked={mode === v}
          aria-label={label}
          title={label}
          onClick={() => setMode(v)}
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-full transition active:scale-90",
            mode === v
              ? "bg-[var(--brand-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:text-[var(--brand-primary)]",
          )}
        >
          <Icon size={12} />
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [commOpen, setCommOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lang, setLang } = useLanguage();
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await signOut(); navigate({ to: "/" }); };
  const isProAccount = roles.includes("professional") || roles.includes("researcher") || roles.includes("admin") || roles.includes("super_admin");
  const accountHomePath = isProAccount ? "/tableau-de-bord" : "/mon-compte";
  const accountHomeLabel = isProAccount ? "Tableau de bord" : "Mon compte";
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = (to: string) =>
    cn(
      "relative whitespace-nowrap text-[11px] font-semibold transition-colors py-2 xl:text-[12px]",
      pathname === to
        ? "text-[var(--brand-primary)]"
        : "text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)]",
      "after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-[var(--brand-primary)] after:transition-all",
      pathname === to ? "after:w-full" : "after:w-0 hover:after:w-full",
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 backdrop-blur-md border-b transition-shadow",
        "bg-[var(--color-surface)]",
        scrolled ? "shadow-iwosan-sm border-[var(--brand-border-light)]" : "border-transparent",
      )}
    >
      <div className="container-iwosan relative flex h-[72px] min-w-0 items-center justify-between gap-2 lg:h-[82px] lg:gap-3">
        <Link to="/" className="group flex shrink-0 items-center gap-2">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center text-white">
            <Leaf size={18} />
          </div>
          <div className="leading-none min-w-0">
            <div className="font-extrabold text-[20px] tracking-tight text-[var(--brand-primary)]">
              IWOSAN
            </div>
            <div className="hidden mt-0.5 max-w-[118px] leading-[1.05] text-[var(--color-text-muted)] lg:block">
              <span className="block text-[8px]">Savoirs africains</span>
              <span className="block text-[8px]">document&eacute;s et vivants</span>
            </div>
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-x-1 lg:flex xl:gap-x-1.5">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)}>
              {l.label}
            </Link>
          ))}
          <div
            className="relative"
            onMouseEnter={() => setCommOpen(true)}
            onMouseLeave={() => setCommOpen(false)}
          >
            <button
              className={cn(
                "inline-flex items-center gap-1 whitespace-nowrap py-2 text-[0px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)]",
              )}
              aria-label={displayLabels.community}
            >
              <span className="text-[11px] xl:text-[12px]">{displayLabels.community}</span>
              <ChevronDown size={14} />
            </button>
            <div
              className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-1 w-60 bg-[var(--color-surface)] rounded-[12px] shadow-iwosan-lg border border-[var(--brand-border-light)] p-2 transition-all duration-200 origin-top",
                commOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none",
              )}
            >
              {communityLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="block px-3 py-2 rounded-md text-[14px] text-[var(--color-text-secondary)] hover:bg-[var(--brand-primary-subtle)] hover:text-[var(--brand-primary)]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          {tailLinks.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-1.5 xl:flex">
          <div className="flex items-center gap-0.5 text-[10px] font-semibold border border-[var(--brand-border)] rounded-full px-0.5 py-0.5">
            <button
              onClick={() => setLang("fr")}
              aria-pressed={lang === "fr"}
              className={cn(
                "px-1 py-0.5 rounded-full transition active:scale-95",
                lang === "fr"
                  ? "bg-[var(--brand-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--brand-primary)]",
              )}
            >
              FR
            </button>
            <button
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              className={cn(
                "px-1 py-0.5 rounded-full transition active:scale-95",
                lang === "en"
                  ? "bg-[var(--brand-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--brand-primary)]",
              )}
            >
              EN
            </button>
          </div>

          <ThemeSwitch />
          <NotificationBell compact />

          <Link
            to="/panier"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--brand-border)] text-[var(--color-text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            aria-label="Panier"
          >
            <ShoppingCart size={14} />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--brand-gold)] px-1 text-[9px] font-bold text-[var(--color-text-primary)]">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to={accountHomePath as never} className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)] active:scale-95 transition xl:text-[13px]">
                <LayoutDashboard size={16} /> {accountHomeLabel}
              </Link>
              <button onClick={handleLogout} className="h-9 px-3 inline-flex items-center gap-1 rounded-full border border-[var(--brand-border)] text-[0px] font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] active:scale-95 transition">
                <span className="text-[12px] xl:text-[13px]">{displayLabels.logout}</span>
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="whitespace-nowrap text-[12px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)] active:scale-95 transition xl:text-[13px]">
                Se connecter
              </Link>
              <Link to="/inscription" className="h-9 px-3 inline-flex items-center rounded-full bg-[var(--brand-primary)] text-white text-[12px] font-semibold hover:bg-[var(--brand-primary-dark)] active:scale-95 transition shadow-iwosan-sm xl:text-[13px]">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile compact actions: theme + hamburger always visible */}
        <div className="ml-auto flex shrink-0 items-center gap-2 xl:hidden">
          <div className="hidden sm:block lg:hidden">
            <NotificationBell />
          </div>
          <Link
            to="/panier"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--brand-border)] sm:inline-flex lg:hidden"
            aria-label="Panier"
          >
            <ShoppingCart size={17} />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--brand-gold)] px-1 text-[10px] font-bold">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link to={accountHomePath as never} className="hidden h-10 items-center gap-1.5 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white shadow-iwosan-sm transition active:scale-95 sm:inline-flex lg:hidden" aria-label={accountHomeLabel}>
              <LayoutDashboard size={15} /> Espace
            </Link>
          ) : (
            <Link
              to="/inscription"
              className="hidden h-10 items-center rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white shadow-iwosan-sm transition active:scale-95 sm:inline-flex lg:hidden"
              aria-label="S'inscrire"
            >
              S'inscrire
            </Link>
          )}
          <button
            className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-text-primary)] transition hover:bg-[var(--brand-surface-alt)] active:scale-95 xl:static xl:translate-y-0"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[999] xl:hidden transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <div
          className="absolute inset-0 bg-black/65"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-[88vw] max-w-[330px] flex-col border-l border-[#eadfce] bg-white text-[#1f2933] shadow-2xl opacity-100 transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Account actions */}
          <div className="p-3 border-b border-[#eadfce] bg-[#faf7ef] shrink-0">
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-white active:scale-95 transition"
              >
                <X size={20} />
              </button>
            </div>
            {user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link to={accountHomePath as never} className="h-9 inline-flex items-center justify-center gap-1 rounded-full bg-[var(--brand-primary)] text-white font-semibold text-[12px] active:scale-95 transition hover:bg-[var(--brand-primary-dark)]">
                  <LayoutDashboard size={16} /> Mon espace
                </Link>
                <button onClick={handleLogout} className="h-9 inline-flex items-center justify-center gap-1 rounded-full border border-[var(--brand-border)] text-[0px] font-semibold text-[var(--color-text-primary)] active:scale-95 transition hover:border-red-400 hover:text-red-600">
                  <span className="text-[12px]">{displayLabels.logout}</span>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/connexion" className="h-9 inline-flex items-center justify-center gap-1 rounded-full border border-[#c9b99d] bg-white text-[#1f2933] font-semibold text-[12px] shadow-sm active:scale-95 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                  <LogIn size={16} /> Se connecter
                </Link>
                <Link to="/inscription" className="h-9 inline-flex items-center justify-center gap-1 rounded-full bg-[var(--brand-primary)] text-white font-semibold text-[12px] active:scale-95 transition hover:bg-[var(--brand-primary-dark)]">
                  <UserPlus size={16} /> S'inscrire
                </Link>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[12px] font-semibold border border-[var(--brand-border)] rounded-full p-1 bg-[var(--color-surface)]">
                <button
                  onClick={() => setLang("fr")}
                  className={cn(
                    "px-3 py-0.5 rounded-full transition",
                    lang === "fr"
                      ? "bg-[var(--brand-primary)] text-white"
                      : "text-[var(--color-text-muted)]",
                  )}
                >
                  FR
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={cn(
                    "px-3 py-0.5 rounded-full transition",
                    lang === "en"
                      ? "bg-[var(--brand-primary)] text-white"
                      : "text-[var(--color-text-muted)]",
                  )}
                >
                  EN
                </button>
              </div>
              <ThemeSwitch />
            </div>
          </div>

          <nav className="flex shrink-0 flex-col gap-0.5 bg-white px-3 py-2 text-left">
            {[...navLinks, ...communityLinks, ...tailLinks].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex min-h-9 w-full items-center justify-start rounded-md px-3 text-left text-[14px] font-semibold transition active:scale-[0.98]",
                  pathname === l.to
                    ? "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"
                    : "text-[var(--color-text-primary)] hover:bg-[var(--brand-primary-subtle)] hover:text-[var(--brand-primary)]",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {user && (
            <>
              <div className="h-px bg-[#eadfce]" />

              <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain bg-white px-3 py-2 pb-5 text-left">
                {accountLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={cn(
                      "flex min-h-9 w-full items-center justify-start rounded-md px-3 text-left text-[14px] font-semibold transition active:scale-[0.98]",
                      pathname === l.to
                        ? "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--brand-primary-subtle)] hover:text-[var(--brand-primary)]",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/mon-compte/notifications"
                  className="flex min-h-9 w-full items-center justify-start rounded-md px-3 text-left text-[14px] font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--brand-primary-subtle)] hover:text-[var(--brand-primary)] active:scale-[0.98]"
                >
                  Notifications
                </Link>
              </nav>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
