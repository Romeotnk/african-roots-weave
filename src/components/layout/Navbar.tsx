import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Leaf, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";


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

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [commOpen, setCommOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  const linkClass = (to: string) =>
    cn(
      "relative text-[14px] font-medium transition-colors py-2",
      pathname === to ? "text-[var(--brand-primary)]" : "text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)]",
      "after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-[var(--brand-primary)] after:transition-all",
      pathname === to ? "after:w-full" : "after:w-0 hover:after:w-full",
    );

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b transition-shadow",
      scrolled ? "shadow-iwosan-sm border-[var(--brand-border-light)]" : "border-transparent"
    )}>
      <div className="container-iwosan flex items-center justify-between h-[72px]">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center text-white">
            <Leaf size={18} />
          </div>
          <div className="leading-none">
            <div className="font-extrabold text-[20px] tracking-tight text-[var(--brand-primary)]">IWOSAN</div>
            <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 hidden sm:block">Le savoir africain, documenté et vivant</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)}>{l.label}</Link>
          ))}
          <div className="relative" onMouseEnter={() => setCommOpen(true)} onMouseLeave={() => setCommOpen(false)}>
            <button className={cn("inline-flex items-center gap-1 text-[14px] font-medium py-2 text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)]")}>
              Communauté <ChevronDown size={14} />
            </button>
            <div className={cn(
              "absolute top-full left-1/2 -translate-x-1/2 mt-1 w-60 bg-white rounded-[12px] shadow-iwosan-lg border border-[var(--brand-border-light)] p-2 transition-all duration-200 origin-top",
              commOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
            )}>
              {communityLinks.map((l) => (
                <Link key={l.to} to={l.to} className="block px-3 py-2 rounded-md text-[14px] text-[var(--color-text-secondary)] hover:bg-[var(--brand-primary-subtle)] hover:text-[var(--brand-primary)]">{l.label}</Link>
              ))}
            </div>
          </div>
          {tailLinks.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)}>{l.label}</Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1 text-[12px] font-semibold border border-[var(--brand-border)] rounded-full px-1 py-1">
            <button className="px-2 py-0.5 rounded-full bg-[var(--brand-primary)] text-white">FR</button>
            <button className="px-2 py-0.5 text-[var(--color-text-muted)]">EN</button>
          </div>
          <Link to="/connexion" className="text-[14px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)]">Se connecter</Link>
          <Link to="/inscription" className="h-10 px-5 inline-flex items-center rounded-full bg-[var(--brand-primary)] text-white text-[14px] font-semibold hover:bg-[var(--brand-primary-dark)] transition">S'inscrire</Link>
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-40 lg:hidden transition-opacity", open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-white shadow-iwosan-xl flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="h-[72px] flex items-center justify-between px-5 border-b border-[var(--brand-border-light)]">
            <span className="font-extrabold text-[var(--brand-primary)]">IWOSAN</span>
            <button onClick={() => setOpen(false)}><X size={22} /></button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
            {[...navLinks, ...communityLinks, ...tailLinks].map((l) => (
              <Link key={l.to} to={l.to} className="px-3 py-3 rounded-md text-[15px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--brand-primary-subtle)] hover:text-[var(--brand-primary)]">{l.label}</Link>
            ))}
            <div className="mt-4 pt-4 border-t border-[var(--brand-border-light)] flex flex-col gap-2">
              <Link to="/connexion" className="h-12 inline-flex items-center justify-center rounded-md border border-[var(--brand-border)] font-semibold">Se connecter</Link>
              <Link to="/inscription" className="h-12 inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] text-white font-semibold">S'inscrire</Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
