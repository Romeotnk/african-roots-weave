import { cn } from "@/lib/utils";

export function SectionHeader({
  label,
  title,
  subtitle,
  align = "left",
  action,
  invert = false,
}: {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-10 md:mb-14 flex flex-col md:flex-row md:items-end gap-6",
        align === "center" && "md:flex-col md:items-center text-center",
      )}
    >
      <div className={cn("flex-1", align === "center" && "max-w-2xl mx-auto")}>
        {label && (
          <div
            className={cn("flex items-center gap-3 mb-3", align === "center" && "justify-center")}
          >
            <span className="h-px w-8 bg-[var(--brand-primary)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
              {label}
            </span>
            <span className="h-px w-8 bg-[var(--brand-primary)]" />
          </div>
        )}
        <h2
          className={cn(
            "text-[28px] md:text-[40px]",
            invert ? "text-white" : "text-[var(--color-text-primary)]",
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "mt-3 text-[16px] md:text-[18px] leading-[1.7] max-w-2xl",
              invert ? "text-white/70" : "text-[var(--color-text-secondary)]",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

