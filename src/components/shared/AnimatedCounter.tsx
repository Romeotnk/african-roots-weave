import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

export function AnimatedCounter({
  value,
  suffix = "",
  duration = 1800,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 });
  const [n, setN] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return (
    <span
      ref={ref}
      className="font-extrabold text-[40px] md:text-[48px] text-[var(--brand-primary)] tabular-nums"
    >
      {n.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}
