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

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">Cette page n'existe pas ou a été déplacée.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const showDetails = import.meta.env.DEV;
  useEffect(() => {
    reportClientError(error, { boundary: "root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Cette page n'a pas pu charger</h1>
        <p className="mt-2 text-sm text-muted-foreground">Une erreur est survenue.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Réessayer</button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Accueil</a>
        </div>
        {showDetails && <pre className="mt-5 max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-left text-xs text-slate-100">{error.stack || error.message}</pre>}
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async (): Promise<{ cspNonce?: string; [key: string]: string | undefined }> => {
    // Same per-request CSP nonce server/src/app.ts generated (see
    // src/router.tsx for the full chain) — carried through loaderData so
    // both head() (client-side meta tag, auto-picked up by TanStack
    // Router's own hydration code) and RootShell (our manual theme script)
    // can stamp it onto their inline scripts.
    let cspNonce: string | undefined;
    if (import.meta.env.SSR) {
      try {
        cspNonce = (await getCspNonce()) ?? undefined;
      } catch {
        // No request context available (e.g. route-tree generation at build time) — skip.
      }
    }
    try {
      const response = await getSiteConfig();
      return { ...(response.data ?? {}), cspNonce };
    } catch {
      return { cspNonce };
    }
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
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@0,400;0,500&display=swap" },
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
  const maintenanceEnabled = siteConfigQuery.data?.data?.["maintenance.enabled"] === "true";
  const showMaintenance = maintenanceEnabled && !pathname.startsWith("/admin");
  const primaryColor = siteConfigQuery.data?.data?.["site.primaryColor"];
  const goldColor = siteConfigQuery.data?.data?.["site.secondaryColor"];
  const customCss = siteConfigQuery.data?.data?.["site.customCss"]?.replace(/<\/style/gi, "");

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
      {!showMaintenance && !isMinimal && !isDashboard && <Navbar />}
      <main className="flex-1">{showMaintenance ? <MaintenancePage config={siteConfigQuery.data?.data} /> : <Outlet />}</main>
      {!showMaintenance && !isMinimal && !isDashboard && <Footer />}
    </div>
  );
}

function MaintenancePage({ config }: { config?: Record<string, string> | null }) {
  const message = config?.["maintenance.message"] || siteConfig.maintenanceMessage;
  const returnAt = config?.["maintenance.returnAt"] || siteConfig.maintenanceReturnAt;
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--brand-primary-dark)] px-4 text-white">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[16px] bg-white/10"><span className="text-[28px] font-black">I</span></div>
        <h1 className="text-[34px] md:text-[48px]">Maintenance en cours</h1>
        <p className="mt-4 text-white/75">{message}</p>
        <p className="mt-5 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold">Retour estime : {returnAt}</p>
      </div>
    </div>
  );
}
