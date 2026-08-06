import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Copy, Loader2, Percent, Plus, Search, Tag } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
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

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString("fr-FR") : "Sans expiration");

function CouponsPage() {
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
      setError("Le code doit contenir au moins 3 caracteres.");
      return;
    }
    if (!Number.isFinite(discount) || discount <= 0 || discount > 80) {
      setError("La remise doit etre comprise entre 1 et 80%.");
      return;
    }
    if (form.usageLimit && (!Number.isFinite(usageLimit) || usageLimit <= 0)) {
      setError("Le nombre d'utilisations doit etre superieur a zero.");
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
          setMessage("Coupon cree avec succes.");
        },
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Impossible de creer ce coupon."),
      },
    );
  };

  const toggleCoupon = (id: string, isActive: boolean) => {
    setMessage("");
    setError("");
    updateCoupon.mutate(
      { id, payload: { isActive: !isActive } },
      {
        onSuccess: () => setMessage("Statut du coupon mis a jour."),
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Impossible de mettre a jour ce coupon."),
      },
    );
  };

  const copyCode = async (code: string) => {
    setMessage("");
    setError("");
    try {
      await navigator.clipboard.writeText(code);
      setMessage(`Code ${code} copie.`);
    } catch {
      setError("Impossible de copier automatiquement ce code.");
    }
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "researcher", "admin", "super_admin"]}>
      <AccountLayout title="Coupons" description="Creez, activez et surveillez les codes promotionnels de votre boutique.">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={Tag} label="Coupons" value={String(coupons.length)} />
            <StatCard icon={Percent} label="Actifs" value={String(activeCount)} />
            <StatCard icon={Copy} label="Utilisations" value={String(totalUses)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
            <form onSubmit={handleCreate} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="text-[18px] font-bold">Nouveau coupon</h2>
              <Field label="Code">
                <input
                  value={form.code}
                  onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                  placeholder="Ex: BIENVENUE10"
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] uppercase outline-none focus:border-[var(--brand-primary)]"
                />
              </Field>
              <Field label="Remise (%)">
                <input
                  value={form.discount}
                  onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))}
                  inputMode="numeric"
                  placeholder="10"
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </Field>
              <Field label="Nombre d'utilisations (optionnel)">
                <input
                  value={form.usageLimit}
                  onChange={(event) => setForm((current) => ({ ...current, usageLimit: event.target.value }))}
                  inputMode="numeric"
                  placeholder="50"
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </Field>
              <Field label="Expiration (optionnel)">
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </Field>
              <button type="submit" disabled={createCoupon.isPending} className="btn-primary mt-5 h-11 w-full text-[14px]">
                <Plus size={17} /> Creer le coupon
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
                  placeholder="Rechercher un code"
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
                    Impossible de charger vos coupons pour le moment.
                  </div>
                ) : filteredCoupons.length === 0 ? (
                  <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-8 text-center">
                    <Tag className="mx-auto text-[var(--brand-primary)]" size={34} />
                    <h2 className="mt-4 text-[20px] font-bold">Aucun coupon trouve</h2>
                    <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Essayez une autre recherche ou creez un nouveau code.</p>
                  </div>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <article key={coupon.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[17px] font-extrabold tracking-[0.08em] text-[var(--color-text-primary)]">{coupon.code}</h2>
                            <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${coupon.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                              {coupon.isActive ? "Actif" : "Inactif"}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                            {coupon.discount}% - {coupon.usedCount}
                            {coupon.maxUses ? `/${coupon.maxUses}` : ""} utilisations - expire le {formatDate(coupon.expiresAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => copyCode(coupon.code)} className="btn-secondary h-10 px-4 text-[13px]">
                            <Copy size={16} /> Copier
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleCoupon(coupon.id, coupon.isActive)}
                            disabled={updateCoupon.isPending}
                            className="btn-secondary h-10 px-4 text-[13px]"
                          >
                            {coupon.isActive ? "Desactiver" : "Activer"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
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

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/tableau-de-bord/coupons")({
  head: () => ({ meta: [{ title: "Coupons - IWOSAN" }] }),
  component: CouponsPage,
});
