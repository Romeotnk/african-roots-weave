import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X, Leaf, Sun, Moon, LogOut, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme, type ThemeMode } from "@/components/ThemeProvider";
import { useAuth } from "@/lib/auth/AuthContext";
import { getAccountHomePath, isProfessionalAccount } from "@/lib/auth/roles";

const mainLinks = [
  { to: "/", label: "Accueil" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/annuaire", label: "Annuaire" },
  { to: "/pharmacopee", label: "Pharmacopée" },
  { to: "/sante-au-quotidien", label: "Santé au quotidien" },
  { to: "/rites-cultures", label: "Rites & Cultures" },
  { to: "/recettes-sante", label: "Recettes santé" },
  { to: "/discutons-en", label: "Discutons-en" },
  { to: "/agenda", label: "Agenda" },
  { to: "/formations", label: "Formations" },
  { to: "/contact", label: "Contact" },
];

const groupedMobileLinks = [
  {
    label: "PRINCIPAL",
    items: [
      { to: "/", label: "Accueil" },
      { to: "/marketplace", label: "Marketplace" },
      { to: "/annuaire", label: "Annuaire" },
    ],
  },
  {
    label: "SAVOIRS",
    items: [
      { to: "/pharmacopee", label: "Pharmacopée" },
      { to: "/sante-au-quotidien", label: "Santé au quotidien" },
      { to: "/rites-cultures", label: "Rites & Cultures" },
      { to: "/recettes-sante", label: "Recettes santé" },
    ],
  },
  {
    label: "COMMUNAUTÉ",
    items: [
      { to: "/discutons-en", label: "Discutons-en" },
      { to: "/agenda", label: "Agenda" },
      { to: "/formations", label: "Formations" },
    ],
  },
  {
    label: "AUTRE",
    items: [{ to: "/contact", label: "Contact" }],
  },
];

function ThemeSwitch() {
  const { mode, setMode } = useTheme();
  const items: { v: ThemeMode; icon: typeof Sun; label: string }[] = [
    { v: "light", icon: Sun, label: "Clair" },
    { v: "dark", icon: Moon, label: "Sombre" },
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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lang, setLang } = useLanguage();
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const isProAccount = isProfessionalAccount(roles);
  const accountHomePath = getAccountHomePath(roles);
  const accountHomeLabel = isProAccount ? "Tableau de bord" : "Mon compte";

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
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white">
              <Leaf size={18} />
            </div>
            <div className="leading-tight">
              <div className="text-[18px] font-extrabold tracking-[0.14em]">IWOSAN</div>
              <div className="hidden text-[11px] text-white/75 sm:block">Savoirs africains documentés</div>
            </div>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full border border-white/20 px-0.5 py-0.5 text-[11px] font-semibold">
              <button onClick={() => setLang("fr")} className={cn("rounded-full px-2 py-1", lang === "fr" && "bg-white text-[var(--brand-primary-dark)]")}>FR</button>
              <button onClick={() => setLang("en")} className={cn("rounded-full px-2 py-1", lang === "en" && "bg-white text-[var(--brand-primary-dark)]")}>EN</button>
            </div>
            <ThemeSwitch />
            {user ? (
              <>
                <Link to={accountHomePath} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[12px] font-semibold hover:bg-white/10">
                  <LogOut size={14} /> {accountHomeLabel}
                </Link>
                <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[12px] font-semibold hover:bg-white/10">
                  <LogOut size={14} /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold hover:bg-white/10">
                  <LogIn size={14} /> Se connecter
                </Link>
                <Link to="/inscription" className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-gold)] px-4 py-2 text-[12px] font-semibold text-white">
                  <UserPlus size={14} /> S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-b-[3px] border-[var(--brand-gold)] bg-[var(--brand-primary)] text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <div className="container-iwosan flex h-14 items-center justify-between gap-4 overflow-x-auto">
          <nav className="hidden items-center gap-5 lg:flex">
            {mainLinks.map((link, idx) => (
              <span key={link.to} className="flex items-center gap-5">
                {idx > 0 && idx !== 3 && idx !== 7 && idx !== 10 && <span className="h-5 w-px bg-white/12" />}
                <Link to={link.to} className={linkClass(link.to)}>{link.label}</Link>
              </span>
            ))}
          </nav>
          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-white lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
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
              <div className="text-[18px] font-extrabold tracking-[0.14em]">IWOSAN</div>
              <div className="text-[11px] text-white/70">Savoirs africains documentés</div>
            </div>
            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
              <X size={22} />
            </button>
          </div>
          <div className="h-[calc(100%-64px)] overflow-y-auto px-5 py-5">
            <div className="space-y-5">
              {groupedMobileLinks.map((group) => (
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
              ))}
            </div>
            <div className="mt-8 space-y-3 border-t border-white/10 pt-5">
              <div className="flex items-center gap-2 text-[12px]">
                <button onClick={() => setLang("fr")} className={cn("rounded-full border border-white/15 px-3 py-2", lang === "fr" && "bg-white text-[var(--brand-primary-dark)]")}>FR</button>
                <button onClick={() => setLang("en")} className={cn("rounded-full border border-white/15 px-3 py-2", lang === "en" && "bg-white text-[var(--brand-primary-dark)]")}>EN</button>
              </div>
              {user ? (
                <>
                  <Link to={accountHomePath} className="block w-full rounded-full border border-white/15 px-4 py-3 text-center font-semibold" onClick={() => setOpen(false)}>{accountHomeLabel}</Link>
                  <button onClick={logout} className="w-full rounded-full bg-white px-4 py-3 font-semibold text-[var(--brand-primary-dark)]">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link to="/connexion" className="block w-full rounded-full border border-white/15 px-4 py-3 text-center font-semibold" onClick={() => setOpen(false)}>Se connecter</Link>
                  <Link to="/inscription" className="block w-full rounded-full bg-[var(--brand-gold)] px-4 py-3 text-center font-semibold text-white" onClick={() => setOpen(false)}>S'inscrire</Link>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
