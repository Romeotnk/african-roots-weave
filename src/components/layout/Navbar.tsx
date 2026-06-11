import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X, Leaf, ChevronDown, Sun, Moon, Monitor, LogIn, UserPlus, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme, type ThemeMode } from "@/components/ThemeProvider";
import { useAuth } from "@/lib/auth/AuthContext";

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

function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const { mode, setMode, resolved } = useTheme();
  const items: { v: ThemeMode; icon: typeof Sun; label: string }[] = [
    { v: "light", icon: Sun, label: "Clair" },
    { v: "system", icon: Monitor, label: "Auto" },
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
      className="flex items-center gap-0.5 border border-[var(--brand-border)] rounded-full p-1"
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
            "inline-flex items-center justify-center w-7 h-7 rounded-full transition active:scale-90",
            mode === v
              ? "bg-[var(--brand-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:text-[var(--brand-primary)]",
          )}
        >
          <Icon size={13} />
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await signOut(); navigate({ to: "/" }); };

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
      "relative text-[14px] font-medium transition-colors py-2",
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
        "bg-[color-mix(in_oklab,var(--color-bg)_85%,transparent)]",
        scrolled ? "shadow-iwosan-sm border-[var(--brand-border-light)]" : "border-transparent",
      )}
    >
      <div className="container-iwosan flex items-center justify-between gap-2 h-[72px]">
        <Link to="/" className="flex items-center gap-2 group min-w-0 flex-shrink">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center text-white">
            <Leaf size={18} />
          </div>
          <div className="leading-none min-w-0">
            <div className="font-extrabold text-[20px] tracking-tight text-[var(--brand-primary)]">
              IWOSAN
            </div>
            <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 hidden xl:block">
              Le savoir africain, documenté et vivant
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
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
                "inline-flex items-center gap-1 text-[14px] font-medium py-2 text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)]",
              )}
            >
              Communauté <ChevronDown size={14} />
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
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1 text-[12px] font-semibold border border-[var(--brand-border)] rounded-full px-1 py-1">
            <button
              onClick={() => setLang("fr")}
              aria-pressed={lang === "fr"}
              className={cn(
                "px-2 py-0.5 rounded-full transition active:scale-95",
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
                "px-2 py-0.5 rounded-full transition active:scale-95",
                lang === "en"
                  ? "bg-[var(--brand-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--brand-primary)]",
              )}
            >
              EN
            </button>
          </div>

          <ThemeSwitch />

          {user ? (
            <>
              <Link to="/tableau-de-bord" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)] active:scale-95 transition">
                <LayoutDashboard size={16} /> Tableau de bord
              </Link>
              <button onClick={handleLogout} className="h-10 px-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-border)] text-[14px] font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] active:scale-95 transition">
                <LogOut size={15} /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="text-[14px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)] active:scale-95 transition">
                Se connecter
              </Link>
              <Link to="/inscription" className="h-10 px-5 inline-flex items-center rounded-full bg-[var(--brand-primary)] text-white text-[14px] font-semibold hover:bg-[var(--brand-primary-dark)] active:scale-95 transition shadow-iwosan-sm">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile compact actions: theme + hamburger always visible */}
        <div className="flex md:hidden items-center gap-2 ml-auto shrink-0">
          <ThemeSwitch compact />
          <Link
            to="/inscription"
            className="h-10 px-4 inline-flex items-center rounded-full bg-[var(--brand-primary)] text-white text-[13px] font-semibold active:scale-95 transition shadow-iwosan-sm"
            aria-label="S'inscrire"
          >
            S'inscrire
          </Link>
          <button
            className="inline-flex items-center justify-center w-11 h-11 rounded-md text-[var(--color-text-primary)] hover:bg-[var(--brand-surface-alt)] active:scale-95 transition"
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
          "fixed inset-0 z-40 lg:hidden transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-[88%] max-w-[360px] bg-[var(--color-bg)] shadow-iwosan-xl flex flex-col transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="h-[72px] flex items-center justify-between px-5 border-b border-[var(--brand-border-light)] shrink-0">
            <span className="font-extrabold text-[var(--brand-primary)]">IWOSAN</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="w-10 h-10 inline-flex items-center justify-center rounded-md hover:bg-[var(--brand-surface-alt)] active:scale-95 transition"
            >
              <X size={22} />
            </button>
          </div>

          {/* Top sticky auth banner */}
          <div className="p-4 border-b border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/connexion"
                className="h-11 inline-flex items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] text-[var(--color-text-primary)] font-semibold text-[14px] active:scale-95 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              >
                <LogIn size={16} /> Se connecter
              </Link>
              <Link
                to="/inscription"
                className="h-11 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] text-white font-semibold text-[14px] active:scale-95 transition hover:bg-[var(--brand-primary-dark)]"
              >
                <UserPlus size={16} /> S'inscrire
              </Link>
            </div>
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

          <nav className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col gap-1 pb-8">
            {[...navLinks, ...communityLinks, ...tailLinks].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-3 rounded-md text-[15px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--brand-primary-subtle)] hover:text-[var(--brand-primary)] active:scale-[0.98] transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
