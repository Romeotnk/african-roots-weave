import { Copy, Percent } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Coupon } from "@/lib/api/coupons";
import { cn } from "@/lib/utils";

type CouponTicketCardProps = {
  coupon: Coupon;
  onCopy: () => void;
  onToggle: () => void;
  toggling?: boolean;
  formatDate: (value: string | null) => string;
};

export function CouponTicketCard({ coupon, onCopy, onToggle, toggling, formatDate }: CouponTicketCardProps) {
  const { t } = useTranslation();
  const usagePercent = coupon.maxUses ? Math.min(100, Math.round((coupon.usedCount / coupon.maxUses) * 100)) : null;

  return (
    <article className="flex overflow-hidden rounded-[14px] border border-[var(--brand-border-light)] bg-[var(--brand-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex w-[96px] shrink-0 flex-col items-center justify-center gap-1 bg-[linear-gradient(160deg,var(--brand-primary-dark),var(--brand-primary))] px-2 py-4 text-white">
        <Percent size={16} className="opacity-70" />
        <span className="text-[22px] font-extrabold leading-none">
          {coupon.discount}
          {coupon.isPercentage ? "%" : ""}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/70">{t("dashboard.coupons.off")}</span>
      </div>

      <div className="w-0 border-l-2 border-dashed border-[var(--brand-border)]" />

      <div className="flex-1 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[17px] font-extrabold tracking-[0.08em] text-[var(--color-text-primary)]">{coupon.code}</h2>
          <span
            className="rounded-full px-3 py-1 text-[12px] font-bold"
            style={
              coupon.isActive
                ? { backgroundColor: "color-mix(in srgb, var(--brand-success) 15%, transparent)", color: "var(--brand-success)" }
                : { backgroundColor: "var(--brand-surface-alt)", color: "var(--color-text-muted)" }
            }
          >
            {coupon.isActive ? t("dashboard.coupons.active") : t("dashboard.coupons.inactive")}
          </span>
        </div>

        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
          {t("dashboard.coupons.expiresOn", { date: formatDate(coupon.expiresAt) })}
        </p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[12px] text-[var(--color-text-muted)]">
            <span>
              {coupon.usedCount}
              {coupon.maxUses ? ` / ${coupon.maxUses}` : ""} {t("dashboard.coupons.usesLabel")}
            </span>
            {usagePercent !== null && <span>{usagePercent}%</span>}
          </div>
          {usagePercent !== null && (
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--brand-surface-alt)]">
              <div className="h-full rounded-full" style={{ width: `${usagePercent}%`, backgroundColor: "var(--brand-primary)" }} />
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={onCopy} className="btn-secondary h-9 px-4 text-[13px]">
            <Copy size={15} /> {t("dashboard.coupons.copy")}
          </button>
          <button
            type="button"
            onClick={onToggle}
            disabled={toggling}
            className={cn("h-9 rounded-full px-4 text-[13px] font-semibold transition", coupon.isActive ? "btn-secondary" : "bg-[var(--brand-primary)] text-white")}
          >
            {coupon.isActive ? t("dashboard.coupons.deactivate") : t("dashboard.coupons.activate")}
          </button>
        </div>
      </div>
    </article>
  );
}
