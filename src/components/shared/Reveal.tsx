import { useEffect, useRef, useState, type ReactNode } from "react";

// Lightweight scroll-reveal: fades + lifts children in the moment they enter
// the viewport. Deliberately CSS-transition based (not framer-motion, which
// this codebase only loads on the homepage) so pages that don't already pay
// for that ~40kB gzip chunk don't start paying for it just to get a fade-in.
// prefers-reduced-motion is honored globally in styles.css's
// `transition-duration: 0.01ms !important` rule, which overrides the inline
// duration below.
export function Reveal({
  children,
  className,
  delayMs = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "li" | "article";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as "div";
  return (
    <Component
      ref={ref}
      className={className}
      style={{
        transitionProperty: "opacity, transform",
        transitionDuration: "550ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delayMs}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Component>
  );
}

// For a grid/list of N cards: stagger their reveal a little instead of every
// card fading in at once, capped so a 40-item page doesn't queue a
// multi-second cascade.
export const staggerDelay = (index: number, stepMs = 55, capMs = 440) => Math.min(index * stepMs, capMs);
