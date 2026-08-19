import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Copy, Loader2, Percent, Plus, Search, Tag } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { CouponTicketCard } from "@/components/shared/CouponTicketCard";
import { StatCard } from "@/components/shared/StatCard";
import { useCoupons, useCreateCoupon, useUpdateCoupon } from "@/hooks/useCouponsApi";

type CouponForm = {
  code: string;
  discount: string;
  usageLimit: string;
  expiresAt: string;
};

const emptyForm: CouponForm = {
  code: "",
  discount: "",
  usageLimit: "",
  expiresAt: "",
};

function CouponsPage() {
  const { t } = useTranslation();
  const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString("fr-FR") : t("dashboard.coupons.noExpiration"));
  const { data, isLoading, isError } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const coupons = data?.coupons ?? [];

  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredCoupons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return coupons.filter((coupon) => coupon.code.toLowerCase().includes(normalizedQuery));
  }, [coupons, query]);

  const activeCount = coupons.filter((coupon) => coupon.isActive).length;
  const totalUses = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const code = form.code.trim().toUpperCase().replace(/\s+/g, "-");
    const discount = Number(form.discount);
    const usageLimit = Number(form.usageLimit);

    if (code.length < 3) {
      setError(t("dashboard.coupons.codeTooShort"));
      return;
    }
    if (!Number.isFinite(discount) || discount <= 0 || discount > 80) {
      setError(t("dashboard.coupons.discountRange"));
      return;
    }
    if (form.usageLimit && (!Number.isFinite(usageLimit) || usageLimit <= 0)) {
      setError(t("dashboard.coupons.usageLimitInvalid"));
      return;
    }

    createCoupon.mutate(
      {
        code,
        discount,
        isPercentage: true,
        maxUses: form.usageLimit ? usageLimit : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          setForm(emptyForm);
          setMessage(t("dashboard.coupons.created"));
        },
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : t("dashboard.coupons.createError")),
      },
    );
  };

  const toggleCoupon = (id: string, isActive: boolean) => {
    setMessage("");
    setError("");
    updateCoupon.mutate(
      { id, payload: { isActive: !isActive } },
      {
        onSuccess: () => setMessage(t("dashboard.coupons.statusUpdated")),
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : t("dashboard.coupons.updateError")),
      },
    );
  };

  const copyCode = async (code: string) => {
    setMessage("");
    setError("");
    try {
      await navigator.clipboard.writeText(code);
      setMessage(t("dashboard.coupons.codeCopied", { code }));
    } catch {
      setError(t("dashboard.coupons.copyError"));
    }
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <AccountLayout title={t("dashboard.coupons.title")} description={t("dashboard.coupons.description")}>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={Tag} label={t("dashboard.coupons.statCoupons")} value={coupons.length} />
            <StatCard icon={Percent} label={t("dashboard.coupons.statActive")} value={activeCount} tone="success" />
            <StatCard icon={Copy} label={t("dashboard.coupons.statUses")} value={totalUses} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
            <form onSubmit={handleCreate} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="text-[18px] font-bold">{t("dashboard.coupons.newCoupon")}</h2>
              <Field label={t("dashboard.coupons.codeLabel")}>
                <input
                  value={form.code}
                  onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                  placeholder="Ex: BIENVENUE10"
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] uppercase outline-none focus:border-[var(--brand-primary)]"
                />
              </Field>
              <Field label={t("dashboard.coupons.discountLabel")}>
                <input
                  value={form.discount}
                  onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))}
                  inputMode="numeric"
                  placeholder="10"
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </Field>
              <Field label={t("dashboard.coupons.usageLimitLabel")}>
                <input
                  value={form.usageLimit}
                  onChange={(event) => setForm((current) => ({ ...current, usageLimit: event.target.value }))}
                  inputMode="numeric"
                  placeholder="50"
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </Field>
              <Field label={t("dashboard.coupons.expirationLabel")}>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </Field>
              <button type="submit" disabled={createCoupon.isPending} className="btn-primary mt-5 h-11 w-full text-[14px]">
                <Plus size={17} /> {t("dashboard.coupons.createButton")}
              </button>
              {message && <p className="mt-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
              {error && <p className="mt-4 rounded-[8px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</p>}
            </form>

            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("dashboard.coupons.searchPlaceholder")}
                  className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </label>

              <div className="mt-5 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-10">
                    <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
                  </div>
                ) : isError ? (
                  <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
                    {t("dashboard.coupons.loadError")}
                  </div>
                ) : filteredCoupons.length === 0 ? (
                  <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-8 text-center">
                    <Tag className="mx-auto text-[var(--brand-primary)]" size={34} />
                    <h2 className="mt-4 text-[20px] font-bold">{t("dashboard.coupons.emptyTitle")}</h2>
                    <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("dashboard.coupons.emptyDesc")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCoupons.map((coupon) => (
                      <CouponTicketCard
                        key={coupon.id}
                        coupon={coupon}
                        onCopy={() => copyCode(coupon.code)}
                        onToggle={() => toggleCoupon(coupon.id, coupon.isActive)}
                        toggling={updateCoupon.isPending}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
      </AccountLayout>
    </ProtectedRoute>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block text-[13px] font-bold text-[var(--color-text-primary)]">
      {label}
      {children}
    </label>
  );
}


export const Route = createFileRoute("/tableau-de-bord/coupons")({
  head: () => ({ meta: [{ title: "Coupons - IWOSAN" }] }),
  component: CouponsPage,
});
