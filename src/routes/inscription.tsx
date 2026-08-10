import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Eye, EyeOff, ShieldCheck, Sparkles, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { SocialAuthButtons } from "@/components/shared/SocialAuthButtons";
import { TurnstileWidget } from "@/components/shared/TurnstileWidget";
import { useLanguage } from "@/components/LanguageProvider";
import { register } from "@/lib/api/auth";
import { getPasswordValidationError } from "@/lib/auth/password";
import { signInWithSocialProvider } from "@/lib/auth/social";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

export const Route = createFileRoute("/inscription")({
  head: () => ({ meta: [{ title: "Inscription - IWOSAN" }] }),
  component: Inscription,
});

type AccountType = "user" | "professional";

function useAccountTypes(t: (key: string) => string): Array<{
  id: AccountType;
  label: string;
  badge: string;
  desc: string;
  details: string[];
  Icon: typeof User;
}> {
  return [
    {
      id: "user",
      label: t("auth.register.userType.label"),
      badge: t("auth.register.userType.badge"),
      desc: t("auth.register.userType.description"),
      details: [
        t("auth.register.userType.detail1"),
        t("auth.register.userType.detail2"),
        t("auth.register.userType.detail3"),
      ],
      Icon: User,
    },
    {
      id: "professional",
      label: t("auth.register.professionalType.label"),
      badge: t("auth.register.professionalType.badge"),
      desc: t("auth.register.professionalType.description"),
      details: [
        t("auth.register.professionalType.detail1"),
        t("auth.register.professionalType.detail2"),
        t("auth.register.professionalType.detail3"),
      ],
      Icon: BriefcaseBusiness,
    },
  ];
}

function Inscription() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const accountTypes = useAccountTypes(t);
  const [accountType, setAccountType] = useState<AccountType>("user");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("BJ");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState<"google" | "facebook" | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const selectedType = accountTypes.find((item) => item.id === accountType) ?? accountTypes[0];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.register.passwordMismatch"));
      return;
    }

    if (!acceptedTerms) {
      setError(t("auth.register.termsRequired"));
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError(t("auth.register.captchaRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await register({
        email,
        password,
        firstName,
        lastName,
        country,
        role: accountType === "professional" ? "PROFESSIONAL" : "USER",
        language,
        turnstileToken: turnstileToken ?? undefined,
      });
      setMessage(
        accountType === "professional"
          ? t("auth.register.proSuccess")
          : response.message || t("auth.register.genericSuccess"),
      );
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : t("auth.register.genericError"));
    } finally {
      setIsSubmitting(false);
      setTurnstileToken(null);
      setTurnstileResetKey((current) => current + 1);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "facebook") => {
    setError(null);
    setMessage(null);
    setIsSocialSubmitting(provider);

    try {
      await signInWithSocialProvider(provider, accountType);
    } catch (socialError) {
      setError(socialError instanceof Error ? socialError.message : t("auth.register.socialError"));
      setIsSocialSubmitting(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-[var(--brand-primary)] text-white">
            <Sparkles size={18} />
          </span>
          <span className="font-extrabold text-[24px] text-[var(--brand-primary)]">IWOSAN</span>
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <section className="overflow-hidden rounded-[8px] border border-[var(--brand-border-light)] bg-white">
            <div className="bg-[var(--brand-primary)] p-6 text-white md:p-8">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em]">
                <ShieldCheck size={14} /> {t("auth.register.heroBadge")}
              </p>
              <h1 className="mt-5 text-[34px] leading-tight md:text-[46px]">{t("auth.register.heroTitle")}</h1>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/85">
                {t("auth.register.heroSubtitle")}
              </p>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2 md:p-5">
              {accountTypes.map((item) => {
                const Icon = item.Icon;
                const selected = accountType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAccountType(item.id);
                      setError(null);
                      setMessage(null);
                    }}
                    className={`min-h-[260px] rounded-[8px] border p-5 text-left transition ${
                      selected
                        ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] shadow-iwosan-md"
                        : "border-[var(--brand-border-light)] bg-white hover:border-[var(--brand-primary)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`grid h-12 w-12 place-items-center rounded-[8px] ${selected ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)] text-[var(--brand-primary)]"}`}>
                        <Icon size={21} />
                      </span>
                      {selected && <CheckCircle2 size={22} className="text-[var(--brand-primary)]" />}
                    </div>
                    <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">{item.badge}</p>
                    <h2 className="mt-2 text-[22px] font-extrabold text-[var(--color-text-primary)]">{item.label}</h2>
                    <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-muted)]">{item.desc}</p>
                    <ul className="mt-4 space-y-2">
                      {item.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
                          <CheckCircle2 size={15} className="text-[var(--brand-primary)]" /> {detail}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5 shadow-iwosan-xl md:p-7">
            <div className="flex flex-col gap-2 border-b border-[var(--brand-border-light)] pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">{selectedType.badge}</p>
                <h2 className="mt-1 text-[26px] font-extrabold">{t("auth.register.title", { type: selectedType.label.toLowerCase() })}</h2>
              </div>
              <span className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-surface-alt)] px-4 text-[13px] font-bold text-[var(--color-text-secondary)]">
                <selectedType.Icon size={16} /> {selectedType.label}
              </span>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input placeholder={t("auth.register.firstNamePlaceholder")} value={firstName} onChange={(event) => setFirstName(event.target.value)} required className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 outline-none focus:border-[var(--brand-primary)]" />
                <input placeholder={t("auth.register.lastNamePlaceholder")} value={lastName} onChange={(event) => setLastName(event.target.value)} required className="h-11 rounded-[8px] border border-[var(--brand-border)] px-4 outline-none focus:border-[var(--brand-primary)]" />
              </div>
              <input type="email" placeholder={t("auth.register.emailPlaceholder")} value={email} onChange={(event) => setEmail(event.target.value)} required className="h-11 w-full rounded-[8px] border border-[var(--brand-border)] px-4 outline-none focus:border-[var(--brand-primary)]" />
              <CountrySelect value={country} onChange={setCountry} required className="h-11 w-full rounded-[8px] border border-[var(--brand-border)] bg-white px-4 outline-none" />

              {accountType === "professional" && (
                <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4 text-[13px] leading-6 text-[var(--color-text-secondary)]">
                  {t("auth.register.proNotice")}
                </div>
              )}

              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder={t("auth.register.passwordPlaceholder")} value={password} onChange={(event) => setPassword(event.target.value)} required className="h-11 w-full rounded-[8px] border border-[var(--brand-border)] px-4 pr-11 outline-none focus:border-[var(--brand-primary)]" />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder={t("auth.register.confirmPasswordPlaceholder")} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required className="h-11 w-full rounded-[8px] border border-[var(--brand-border)] px-4 pr-11 outline-none focus:border-[var(--brand-primary)]" />
                <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" aria-label={showConfirmPassword ? t("auth.register.hideConfirm") : t("auth.register.showConfirm")}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <label className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)]">
                <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 accent-[var(--brand-primary)]" />
                <span>{t("auth.register.termsLabel")}</span>
              </label>

              {TURNSTILE_SITE_KEY && (
                <TurnstileWidget
                  key={turnstileResetKey}
                  siteKey={TURNSTILE_SITE_KEY}
                  onVerify={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                />
              )}

              {error && <p className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
              {message && (
                <div className="space-y-3 rounded-[8px] border border-emerald-200 bg-emerald-50 px-3 py-3">
                  <p className="text-[13px] text-emerald-700">{message}</p>
                  <Link
                    to="/connexion"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white hover:bg-[var(--brand-primary-dark)]"
                  >
                    {t("auth.register.loginNow")} <ArrowRight size={15} />
                  </Link>
                </div>
              )}

              {!message && (
                <button type="submit" disabled={isSubmitting || Boolean(TURNSTILE_SITE_KEY) && !turnstileToken} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] font-semibold text-white hover:bg-[var(--brand-primary-dark)] disabled:cursor-not-allowed disabled:opacity-70">
                  {isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")} <ArrowRight size={17} />
                </button>
              )}
            </form>

            <div className="my-6 flex items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
              <div className="h-px flex-1 bg-[var(--brand-border-light)]" /> {t("auth.orContinueWith")} <div className="h-px flex-1 bg-[var(--brand-border-light)]" />
            </div>
            {accountType === "professional" && (
              <p className="mb-3 rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] px-3 py-2 text-[12px] leading-5 text-[var(--color-text-secondary)]">
                {t("auth.register.socialProNotice")}
              </p>
            )}
            <SocialAuthButtons pending={isSocialSubmitting} onSelect={handleSocialSignIn} openingLabel={t("auth.opening")} />
            <p className="mt-6 text-center text-[14px] text-[var(--color-text-muted)]">
              {t("auth.register.alreadyRegistered")} <Link to="/connexion" className="font-semibold text-[var(--brand-primary)]">{t("auth.register.login")}</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}