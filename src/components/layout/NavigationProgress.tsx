import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Fine barre de chargement en haut, visible pendant la navigation entre routes.
 */
export function NavigationProgress() {
  const status = useRouterState({ select: (s) => s.status });
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;
    if (status === "pending") {
      setVisible(true);
      setProgress(15);
      const tick = () => {
        setProgress((p) => (p < 85 ? p + (90 - p) * 0.08 : p));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } else {
      setProgress(100);
      timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
    };
  }, [status]);

  return (
    <div
      aria-hidden
      className="fixed left-0 top-0 z-[100] h-[3px] transition-all duration-200 ease-out"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        background: "linear-gradient(90deg, var(--brand-primary), var(--brand-gold))",
        boxShadow: "0 0 10px var(--brand-gold)",
      }}
    />
  );
}
