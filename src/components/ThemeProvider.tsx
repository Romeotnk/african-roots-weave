import { useEffect, type ReactNode } from "react";

/**
 * Synchronise le thème (clair / sombre) avec la préférence système de l'utilisateur.
 * Aucune interaction requise : suit `prefers-color-scheme` en temps réel.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (dark: boolean) => {
      const root = document.documentElement;
      root.classList.toggle("dark", dark);
      root.style.colorScheme = dark ? "dark" : "light";
    };
    apply(mql.matches);
    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return <>{children}</>;
}
