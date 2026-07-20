import { cn } from "@/lib/utils";

type Variant =
  | "category"
  | "verified"
  | "status-active"
  | "status-pending"
  | "type-physical"
  | "type-service"
  | "type-digital"
  | "gold"
  | "outline";

const styles: Record<Variant, string> = {
  category: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
  verified: "bg-[var(--brand-gold)] text-white",
  "status-active": "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
  "status-pending": "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)]",
  "type-physical": "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
  "type-service": "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
  "type-digital": "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
  gold: "bg-[var(--brand-gold)] text-white",
  outline: "border border-white/40 text-white",
};

export function Badge({
  children,
  variant = "category",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

