import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Leaf } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNewsletterSubscription } from "@/hooks/useNewsletterApi";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useLanguage } from "@/components/LanguageProvider";

const parseMenuLinks = (value: string | undefined): { to: string; label: string }[] | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

function useDefaultFooterNav(t: (key: string) => string) {
  return [
    { to: "/", label: t("nav.home") },
    { to: "/marketplace", label: t("nav.marketplace") },
    { to: "/annuaire", label: t("nav.directory") },
    { to: "/agenda", label: t("nav.agenda") },
    { to: "/formations", label: t("nav.formations") },
  ];
}

function useDefaultFooterEspaces(t: (key: string) => string) {
  return [
    { to: "/pharmacopee", label: t("nav.pharmacopoeia") },
    { to: "/rites-cultures", label: t("nav.ritesCultures") },
    { to: "/sante-au-quotidien", label: t("nav.dailyHealth") },
    { to: "/recettes-sante", label: t("nav.healthRecipes") },
    { to: "/forum", label: t("nav.forum") },
  ];
}

const colTitle = "text-white text-[11px] font-semibold uppercase tracking-[0.1em] mb-5";
const link =
  "block text-white/70 hover:text-[var(--brand-gold)] transition-colors text-[14px] py-1.5";

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/iwosan" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/iwosan" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/iwosan" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/iwosan" },
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@iwosan" },
];

export function Footer() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");
  const newsletter = useNewsletterSubscription();
  const siteConfigQuery = useSiteConfig();
  const defaultFooterNav = useDefaultFooterNav(t);
  const defaultFooterEspaces = useDefaultFooterEspaces(t);
  const footerNav = useMemo(
    () => parseMenuLinks(siteConfigQuery.data?.data?.["site.menus.footerNav"]) ?? defaultFooterNav,
    [siteConfigQuery.data, defaultFooterNav],
  );
  const footerEspaces = useMemo(
    () => parseMenuLinks(siteConfigQuery.data?.data?.["site.menus.footerEspaces"]) ?? defaultFooterEspaces,
    [siteConfigQuery.data, defaultFooterEspaces],
  );
  const siteName = siteConfigQuery.data?.data?.["site.name"] || "IWOSAN";
  const logoUrl = siteConfigQuery.data?.data?.["site.logoUrl"];

  return (
    <footer className="bg-[var(--brand-primary-dark)] text-white">
      <div className="container-iwosan py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Leaf size={18} />
                </div>
              )}
              <span className="text-[20px] font-extrabold">{siteName}</span>
            </div>
            <p className="mb-5 text-[14px] leading-[1.7] text-white/70">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[var(--brand-gold)] hover:text-[var(--brand-primary-dark)]"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className={colTitle}>{t("footer.navigation")}</h4>
            {footerNav.map((item) => (
              <Link key={item.to} className={link} to={item.to}>{item.label}</Link>
            ))}
          </div>
          <div>
            <h4 className={colTitle}>{t("footer.ourSpaces")}</h4>
            {footerEspaces.map((item) => (
              <Link key={item.to} className={link} to={item.to}>{item.label}</Link>
            ))}
          </div>
          <div>
            <h4 className={colTitle}>{t("footer.contactLegal")}</h4>
            <a className={link} href="mailto:contact@iwosan.africa">contact@iwosan.africa</a>
            <a className={link} href="https://wa.me/221770000000" target="_blank" rel="noreferrer">WhatsApp : +221 77 000 00 00</a>
            <Link className={link} to="/$slug" params={{ slug: "cgu" }}>{t("footer.terms")}</Link>
            <Link className={link} to="/$slug" params={{ slug: "politique-confidentialite" }}>{t("footer.privacy")}</Link>
            <Link className={link} to="/$slug" params={{ slug: "mentions-legales" }}>{t("footer.legalNotice")}</Link>
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (!email.trim()) return;
                setSubscriptionError("");
                newsletter.mutate(
                  { email, language },
                  {
                    onSuccess: () => {
                      setSubscribed(true);
                      setEmail("");
                    },
                    onError: (error) => {
                      setSubscriptionError(error instanceof Error ? error.message : t("footer.newsletterError"));
                    },
                  },
                );
              }}
            >
              <label htmlFor="footer-newsletter" className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/80">
                {t("footer.newsletter")}
              </label>
              <div className="flex overflow-hidden rounded-full bg-white">
                <input
                  id="footer-newsletter"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder={t("footer.newsletterPlaceholder")}
                  className="min-w-0 flex-1 px-4 text-[13px] text-[var(--color-text-primary)] outline-none"
                />
                <button type="submit" disabled={newsletter.isPending} className="bg-[var(--brand-gold)] px-4 text-[12px] font-bold text-[var(--brand-primary-dark)] disabled:opacity-70">
                  {newsletter.isPending ? t("footer.newsletterSubmitting") : t("footer.newsletterSubmit")}
                </button>
              </div>
              {subscribed && <p className="mt-2 text-[12px] text-emerald-200">{t("footer.newsletterSuccess")}</p>}
              {subscriptionError && <p className="mt-2 text-[12px] text-red-200">{subscriptionError}</p>}
            </form>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-iwosan flex flex-col items-center justify-between gap-3 py-6 text-[13px] text-white/60 sm:flex-row">
          <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          <span>{t("footer.madeWith")}</span>
        </div>
      </div>
    </footer>
  );
}
