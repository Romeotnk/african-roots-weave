import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";
interface Ctx {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}
const ThemeCtx = createContext<Ctx>({
  mode: "light",
  resolved: "light",
  setMode: () => {},
  toggle: () => {},
});
const KEY = "iwosan_theme";

function apply(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as ThemeMode | null;
      if (stored === "light" || stored === "dark") setModeState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dark = mode === "dark";
    apply(dark);
    setResolved(dark ? "dark" : "light");
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    try {
      localStorage.setItem(KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setMode(resolved === "dark" ? "light" : "dark");
  }, [resolved, setMode]);

  const value = useMemo(
    () => ({ mode, resolved, setMode, toggle }),
    [mode, resolved, setMode, toggle],
  );
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
