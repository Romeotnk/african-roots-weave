import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Copy, Download, Loader2, Network, Search, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAffiliateLink, useMlmTree } from "@/hooks/useMlmApi";
import type { MlmNode } from "@/lib/api/mlm";

type FlatMember = {
  id: string;
  name: string;
  country: string;
  level: number;
  downlineCount: number;
  earnings: number;
  joinedAt: string;
};

const flattenTree = (node: MlmNode | null | undefined): FlatMember[] => {
  if (!node) return [];
  const children = node.children ?? [];
  return children.flatMap((child) => [
    {
      id: child.id,
      name: `${child.user.firstName} ${child.user.lastName}`.trim(),
      country: child.user.country,
      level: child.level,
      downlineCount: child.totalDownlineCount,
      earnings: Number(child.totalEarnings),
      joinedAt: child.createdAt,
    },
    ...flattenTree(child),
  ]);
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;
const formatDate = (value: string) => new Date(value).toLocaleDateString("fr-FR");

const toCsv = (members: FlatMember[]) => {
  const header = "Nom,Pays,Niveau,Filleuls,Gains,Inscrit le";
  const rows = members.map((member) =>
    [member.name, member.country, member.level, member.downlineCount, member.earnings, formatDate(member.joinedAt)].join(","),
  );
  return [header, ...rows].join("\n");
};

function ReseauPage() {
  const { data: tree, isLoading, isError } = useMlmTree();
  const { data: affiliate } = useAffiliateLink();
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | number>("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const members = useMemo(() => flattenTree(tree), [tree]);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesLevel = levelFilter === "all" || member.level === levelFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [member.name, member.country].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesLevel && matchesQuery;
    });
  }, [members, query, levelFilter]);

  const levelTwoCount = members.filter((member) => member.level >= 2).length;
  const totalVolume = members.reduce((sum, member) => sum + member.earnings, 0);

  const copyLink = async () => {
    setMessage("");
    setError("");
    if (!affiliate?.link) {
      setError("Votre lien d'affiliation n'est pas encore disponible.");
      return;
    }
    try {
      await navigator.clipboard.writeText(affiliate.link);
      setMessage("Lien d'invitation copie.");
    } catch {
      setError("Impossible de copier automatiquement le lien. Copiez-le manuellement.");
    }
  };

  const exportList = () => {
    if (members.length === 0) {
      setError("Aucun membre a exporter pour le moment.");
      return;
    }
    setError("");
    const blob = new Blob([toCsv(members)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mon-reseau.csv";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Export CSV telecharge.");
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "admin", "super_admin"]}>
      <AccountLayout
        title="Mon reseau"
        description="Visualisez votre reseau de filleuls sur 3 niveaux et partagez votre lien pour en inviter de nouveaux."
        actions={
          <button type="button" onClick={exportList} className="btn-secondary h-11 px-5 text-[14px]">
            <Download size={17} /> Exporter
          </button>
        }
      >
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={Users} label="Filleuls" value={String(members.length)} />
            <StatCard icon={Network} label="Niveau 2+" value={String(levelTwoCount)} />
            <StatCard icon={TrendingUp} label="Gains du reseau" value={formatMoney(totalVolume)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="text-[18px] font-bold">Inviter un membre</h2>
              <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-muted)]">
                Partagez votre lien de parrainage : toute inscription realisee via ce lien rejoint automatiquement votre reseau.
              </p>
              {affiliate?.link && (
                <p className="mt-3 break-all rounded-[8px] bg-[var(--brand-surface-alt)] px-3 py-2 text-[12px] text-[var(--color-text-secondary)]">
                  {affiliate.link}
                </p>
              )}
              <button type="button" onClick={copyLink} className="btn-primary mt-4 h-11 w-full text-[14px]">
                <Copy size={17} /> Copier mon lien
              </button>
              {message && <p className="mt-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
              {error && <p className="mt-4 rounded-[8px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</p>}
            </aside>

            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher un membre"
                    className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["all", 1, 2, 3] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setLevelFilter(level)}
                      className={`h-10 rounded-full px-4 text-[13px] font-semibold transition ${
                        levelFilter === level
                          ? "bg-[var(--brand-primary)] text-white"
                          : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {level === "all" ? "Tous" : `Niveau ${level}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-10">
                    <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
                  </div>
                ) : isError ? (
                  <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
                    Impossible de charger votre reseau pour le moment.
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-8 text-center">
                    <Users className="mx-auto text-[var(--brand-primary)]" size={34} />
                    <h2 className="mt-4 text-[20px] font-bold">Aucun membre trouve</h2>
                    <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Partagez votre lien pour commencer a construire votre reseau.</p>
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <article key={member.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">{member.name || "Membre"}</h2>
                            <span className="rounded-full border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] px-3 py-1 text-[12px] font-bold text-[var(--color-text-secondary)]">
                              Niveau {member.level}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                            {member.country || "Pays non renseigne"} - {member.downlineCount} filleul(s) - inscrit le {formatDate(member.joinedAt)}
                          </p>
                        </div>
                        <span className="text-[14px] font-extrabold text-[var(--brand-primary)]">{formatMoney(member.earnings)}</span>
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

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/tableau-de-bord/reseau")({
  head: () => ({ meta: [{ title: "Mon reseau - IWOSAN" }] }),
  component: ReseauPage,
});
