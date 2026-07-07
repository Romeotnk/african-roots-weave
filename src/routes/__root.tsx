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
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { CartProvider } from "@/cart/CartContext";
import "@/i18n/jsxPatch";
import { siteConfig } from "@/data/siteConfig";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retour à l'accueil
          </Link>
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
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Accueil
          </a>
        </div>
        {showDetails && (
          <pre className="mt-5 max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-left text-xs text-slate-100">
            {error.stack || error.message}
          </pre>
        )}
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "IWOSAN — Le savoir médical africain, documenté et vivant" },
      {
        name: "description",
        content:
          "Plateforme panafricaine éditoriale, scientifique et communautaire dédiée à la médecine traditionnelle, aux plantes médicinales et aux cultures de guérison africaines.",
      },
      { name: "author", content: "Iwosan" },
      { property: "og:title", content: "IWOSAN — Le savoir médical africain, documenté et vivant" },
      {
        property: "og:description",
        content:
          "Plateforme panafricaine éditoriale, scientifique et communautaire dédiée à la médecine traditionnelle, aux plantes médicinales et aux cultures de guérison africaines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "IWOSAN — Le savoir médical africain, documenté et vivant",
      },
      {
        name: "twitter:description",
        content:
          "Plateforme panafricaine éditoriale, scientifique et communautaire dédiée à la médecine traditionnelle, aux plantes médicinales et aux cultures de guérison africaines.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1819c790-5fdc-422e-96c4-3a4825934d70/id-preview-2ec67662--5c6b0925-718f-4d9a-a7ce-388131a1aaf2.lovable.app-1780928460304.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1819c790-5fdc-422e-96c4-3a4825934d70/id-preview-2ec67662--5c6b0925-718f-4d9a-a7ce-388131a1aaf2.lovable.app-1780928460304.png",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('iwosan_theme');document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t==='dark'?'dark':'light'}catch(e){}",
          }}
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Hide nav/footer on auth & dashboard pages for a cleaner layout
  const isMinimal =
    ["/connexion", "/inscription", "/mot-de-passe-oublie", "/reset-password"].includes(pathname) ||
    pathname.startsWith("/reset-password/");
  const isDashboard = pathname.startsWith("/tableau-de-bord");
  const showMaintenance = siteConfig.maintenanceMode && !pathname.startsWith("/admin");
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                {!showMaintenance && !isMinimal && !isDashboard && <Navbar />}
                <main className="flex-1">
                  {showMaintenance ? <MaintenancePage /> : <Outlet />}
                </main>
                {!showMaintenance && !isMinimal && !isDashboard && <Footer />}
              </div>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function MaintenancePage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--brand-primary-dark)] px-4 text-white">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[16px] bg-white/10">
          <span className="text-[28px] font-black">I</span>
        </div>
        <h1 className="text-[34px] md:text-[48px]">Maintenance en cours</h1>
        <p className="mt-4 text-white/75">{siteConfig.maintenanceMessage}</p>
        <p className="mt-5 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold">
          Retour estime : {siteConfig.maintenanceReturnAt}
        </p>
      </div>
    </div>
  );
}
