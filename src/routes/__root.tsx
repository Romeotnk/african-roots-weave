import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import appCss from "../styles.css?url";
import { reportClientError } from "../lib/error-reporting";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { siteConfig } from "@/data/siteConfig";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { getCspNonce } from "@/lib/api/cspNonce.functions";
import { getSiteConfig } from "@/lib/api/site";
import { AFFILIATE_CODE_STORAGE_KEY, trackAffiliateClick } from "@/lib/api/affiliate";

const isHexColor = (value: string | undefined): value is string => Boolean(value && /^#[0-9a-fA-F]{3,8}$/.test(value));
// Defense-in-depth: these values come from the admin "Identité" panel, not
// end-user input, but are still validated before being interpolated into an
// injected <script> — the whole point of replacing the old free-form JS
// field with dedicated ID inputs is that only a known-safe ID shape ever
// reaches the page, never arbitrary script content.
const isGaId = (value: string | undefined): value is string => Boolean(value && /^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(value));
const isFbPixelId = (value: string | undefined): value is string => Boolean(value && /^\d+$/.test(value));

function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">{t("root.notFoundTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("root.notFoundDesc")}</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("root.backToHome")}</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();
  console.error(error);
  const router = useRouter();
  const showDetails = import.meta.env.DEV;
  useEffect(() => {
    reportClientError(error, { boundary: "root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">{t("root.errorTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("root.errorDesc")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("root.retry")}</button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t("root.home")}</a>
        </div>
        {showDetails && <pre className="mt-5 max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-left text-xs text-slate-100">{error.stack || error.message}</pre>}
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Root route options.staleTime — without this, TanStack Router's default
  // (0) reruns this loader, including the getSiteConfig() network+DB round
  // trip, on EVERY navigation, not just the first page load. Site config
  // (name, banners, theme colors...) rarely changes, so a minute of
  // staleness is invisible to users but removes a full request from every
  // single click.
  staleTime: 60_000,
  loader: async (): Promise<{ cspNonce?: string; [key: string]: string | undefined }> => {
    // Same per-request CSP nonce server/src/app.ts generated (see
    // src/router.tsx for the full chain) — carried through loaderData so
    // both head() (client-side meta tag, auto-picked up by TanStack
    // Router's own hydration code) and RootShell (our manual theme script)
    // can stamp it onto their inline scripts. Runs in parallel with the
    // site config fetch below — the two are independent.
    const cspNoncePromise = import.meta.env.SSR
      ? getCspNonce().catch(() => null)
      : Promise.resolve(null);
    const siteConfigPromise = getSiteConfig().catch(() => null);

    const [cspNonce, response] = await Promise.all([cspNoncePromise, siteConfigPromise]);
    return { ...(response?.data ?? {}), cspNonce: cspNonce ?? undefined };
  },
  head: ({ loaderData }) => {
    const siteName = loaderData?.["site.name"] || "IWOSAN";
    const tagline = loaderData?.["site.tagline"] || "Le savoir médical africain, documenté et vivant";
    const title = `${siteName} - ${tagline}`;
    const description = "Plateforme panafricaine éditoriale, scientifique et communautaire dédiée à la médecine traditionnelle, aux plantes médicinales et aux cultures de guérison africaines.";
    const faviconUrl = loaderData?.["site.faviconUrl"] || "/favicon.svg";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title },
        { name: "description", content: description },
        { name: "author", content: siteName },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { property: "og:image", content: faviconUrl },
        { name: "twitter:image", content: faviconUrl },
        // TanStack Router's client-side hydration reads this to reapply the
        // same nonce to any inline script it injects after hydration.
        ...(loaderData?.cspNonce ? [{ property: "csp-nonce", content: loaderData.cspNonce }] : []),
      ],
      links: [
        { rel: "icon", href: faviconUrl },
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "preconnect", href: "https://images.unsplash.com" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@0,400;0,500&display=swap" },
        { rel: "stylesheet", href: appCss },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const loaderData = Route.useLoaderData();
  return (
    <html lang="fr">
      <head>
        <script
          nonce={loaderData?.cspNonce}
          dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('iwosan_theme');document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t==='dark'?'dark':'light'}catch(e){}" }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <AppShell />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// useSiteConfig() uses useQuery internally, so it has to be called by a
// descendant of QueryClientProvider — calling it directly in RootComponent
// (a sibling of the provider it renders, not a child of it) throws "No
// QueryClient set" on every single render.
function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isMinimal = ["/connexion", "/inscription", "/mot-de-passe-oublie", "/reset-password"].includes(pathname) || pathname.startsWith("/reset-password/");
  const isDashboard = pathname.startsWith("/tableau-de-bord");
  const siteConfigQuery = useSiteConfig();
  const loaderData = Route.useLoaderData();
  const maintenanceEnabled = siteConfigQuery.data?.data?.["maintenance.enabled"] === "true";
  const showMaintenance = maintenanceEnabled && !pathname.startsWith("/admin");
  const primaryColor = siteConfigQuery.data?.data?.["site.primaryColor"];
  const goldColor = siteConfigQuery.data?.data?.["site.secondaryColor"];
  const customCss = siteConfigQuery.data?.data?.["site.customCss"]?.replace(/<\/style/gi, "");
  const gaId = siteConfigQuery.data?.data?.["site.gaId"];
  const fbPixelId = siteConfigQuery.data?.data?.["site.fbPixelId"];

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("aff");
    if (!code || window.localStorage.getItem(AFFILIATE_CODE_STORAGE_KEY) === code) return;
    window.localStorage.setItem(AFFILIATE_CODE_STORAGE_KEY, code);
    trackAffiliateClick(code).catch(() => undefined);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      {(isHexColor(primaryColor) || isHexColor(goldColor)) && (
        <style>{`:root{${isHexColor(primaryColor) ? `--brand-primary:${primaryColor};--brand-primary-dark:${primaryColor};` : ""}${isHexColor(goldColor) ? `--brand-gold:${goldColor};` : ""}}`}</style>
      )}
      {customCss && <style>{customCss}</style>}
      {isGaId(gaId) && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script
            nonce={loaderData?.cspNonce}
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
            }}
          />
        </>
      )}
      {isFbPixelId(fbPixelId) && (
        <script
          nonce={loaderData?.cspNonce}
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbPixelId}');fbq('track','PageView');`,
          }}
        />
      )}
      {!showMaintenance && !isMinimal && !isDashboard && <Navbar />}
      <main className="flex-1">{showMaintenance ? <MaintenancePage config={siteConfigQuery.data?.data} /> : <Outlet />}</main>
      {!showMaintenance && !isMinimal && !isDashboard && <Footer />}
    </div>
  );
}

function MaintenancePage({ config }: { config?: Record<string, string> | null }) {
  const { t } = useTranslation();
  const message = config?.["maintenance.message"] || siteConfig.maintenanceMessage;
  const returnAt = config?.["maintenance.returnAt"] || siteConfig.maintenanceReturnAt;
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--brand-primary-dark)] px-4 text-white">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[16px] bg-white/10"><span className="text-[28px] font-black">I</span></div>
        <h1 className="text-[34px] md:text-[48px]">{t("root.maintenanceTitle")}</h1>
        <p className="mt-4 text-white/75">{message}</p>
        <p className="mt-5 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold">{t("root.estimatedReturn", { date: returnAt })}</p>
      </div>
    </div>
  );
}
