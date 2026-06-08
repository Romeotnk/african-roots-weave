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
  "status-active": "bg-green-50 text-green-700",
  "status-pending": "bg-orange-50 text-orange-700",
  "type-physical": "bg-blue-50 text-blue-700",
  "type-service": "bg-purple-50 text-purple-700",
  "type-digital": "bg-teal-50 text-teal-700",
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
