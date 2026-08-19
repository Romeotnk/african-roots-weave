import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatCardTone = "primary" | "success" | "warning" | "info" | "error";

const LIGHT_TONE_COLOR: Record<StatCardTone, string> = {
  primary: "var(--brand-primary)",
  success: "var(--brand-success)",
  warning: "var(--brand-warning)",
  info: "var(--brand-info)",
  error: "var(--brand-error)",
};

const DARK_TONE_BAR: Record<StatCardTone, string> = {
  primary: "bg-emerald-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  info: "bg-sky-400",
  error: "bg-red-400",
};

const DARK_TONE_BADGE: Record<StatCardTone, string> = {
  primary: "bg-emerald-500/20 text-emerald-300",
  success: "bg-emerald-500/20 text-emerald-300",
  warning: "bg-amber-500/20 text-amber-300",
  info: "bg-sky-500/20 text-sky-300",
  error: "bg-red-500/20 text-red-300",
};

type StatCardProps = {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  tone?: StatCardTone;
  theme?: "light" | "dark";
  badgeLabel?: string;
  className?: string;
};

export function StatCard({ icon: Icon, label, value, suffix, tone = "primary", theme = "light", badgeLabel, className }: StatCardProps) {
  const formattedValue = typeof value === "number" ? value.toLocaleString("fr-FR") : value;

  if (theme === "dark") {
    return (
      <div className={cn("relative overflow-hidden rounded-[12px] border border-white/10 bg-white/[0.04] p-5 shadow-xl", className)}>
        <span className={cn("absolute inset-x-0 top-0 h-[3px]", DARK_TONE_BAR[tone])} />
        {Icon && <Icon size={20} className="text-slate-400" />}
        <p className={cn("text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400", Icon && "mt-3")}>{label}</p>
        <p className="mt-2 text-[28px] font-black text-white">
          {formattedValue}
          {suffix && <span className="ml-1 text-[16px] font-bold text-slate-400">{suffix}</span>}
        </p>
        {badgeLabel && <span className={cn("mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-bold", DARK_TONE_BADGE[tone])}>{badgeLabel}</span>}
      </div>
    );
  }

  return (
    <div className={cn("rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface)] p-5", className)}>
      {Icon && <Icon size={22} style={{ color: LIGHT_TONE_COLOR[tone] }} />}
      <p className={cn("text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]", Icon && "mt-3")}>{label}</p>
      <p className="mt-1 text-[28px] font-extrabold text-[var(--color-text-primary)]">
        {formattedValue}
        {suffix && <span className="ml-1 text-[16px] font-bold text-[var(--color-text-muted)]">{suffix}</span>}
      </p>
      {badgeLabel && (
        <span className="mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${LIGHT_TONE_COLOR[tone]} 15%, transparent)`, color: LIGHT_TONE_COLOR[tone] }}>
          {badgeLabel}
        </span>
      )}
    </div>
  );
}
