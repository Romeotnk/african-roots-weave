import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Loader2, MessageCircle, Share2, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAffiliateLink, useMlmEarnings, useMlmLeaderboard, useMlmStats, useMlmTree, useMyCommissions } from "@/hooks/useMlmApi";
import type { AffiliateEarning, AffiliateNode } from "@/types";

export const Route = createFileRoute("/mon-compte/affiliation")({
  head: () => ({ meta: [{ title: "Parrainage - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["user", "professional", "admin", "super_admin"]}>
      <AffiliationPage />
    </ProtectedRoute>
  ),
});

function buildEarningLabels(t: TFunction): Record<AffiliateEarning["type"], string> {
  return {
    direct_sale: t("account.affiliation.earningDirectSale"),
    level_2: t("account.affiliation.earningLevel2"),
    level_3: t("account.affiliation.earningLevel3"),
  };
}

function flattenTree(node: AffiliateNode): AffiliateNode[] {
  return [node, ...(node.children ?? []).flatMap(flattenTree)];
}

type BackendMlmNode = {
  id: string;
  level: number;
  totalEarnings?: string | number | null;
  createdAt?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
  };
  children?: BackendMlmNode[];
};

type BackendMlmEarning = {
  _sum?: { amount?: string | number | null };
};

type BackendCommission = {
  id?: string;
  amount?: string | number;
  type?: string;
  status?: string;
  createdAt?: string;
  sourceOrder?: { product?: { title?: string } | null } | null;
};

type BackendLeaderboardRow = { rank?: number; name?: string; earnings?: string | number };

const commissionTypeMap: Record<string, AffiliateEarning["type"]> = {
  DIRECT: "direct_sale",
  MLM_LEVEL1: "direct_sale",
  MLM_LEVEL2: "level_2",
  MLM_LEVEL3: "level_3",
};

function toAffiliateEarning(commission: BackendCommission, t: TFunction): AffiliateEarning | null {
  if (!commission.id) return null;
  return {
    id: commission.id,
    date: commission.createdAt ? new Date(commission.createdAt).toLocaleDateString("fr-FR") : "-",
    type: commissionTypeMap[commission.type ?? ""] ?? "direct_sale",
    amount: toAmount(commission.amount),
    status: commission.status === "PAID" ? "paid" : "pending",
    source: commission.sourceOrder?.product?.title ?? t("account.affiliation.defaultOrderSource"),
  };
}

const toAmount = (value: unknown) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

function fromBackendNode(node: BackendMlmNode, t: TFunction): AffiliateNode {
  return {
    id: node.id,
    name: `${node.user?.firstName ?? t("account.affiliation.defaultMemberName")} ${node.user?.lastName ?? ""}`.trim(),
    level: Math.min(Math.max(node.level, 0), 3) as AffiliateNode["level"],
    joinedAt: node.createdAt ? new Date(node.createdAt).toLocaleDateString("fr-FR") : "-",
    active: node.user?.isActive ?? true,
    commissions: toAmount(node.totalEarnings),
    children: node.children?.map((child) => fromBackendNode(child, t)),
  };
}

function TreeNode({
  node,
  selectedId,
  onSelect,
}: {
  node: AffiliateNode;
  selectedId: string;
  onSelect: (node: AffiliateNode) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => onSelect(node)}
        className={`min-w-[132px] rounded-[12px] border p-3 text-center shadow-iwosan-sm transition ${
          selectedId === node.id
            ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]"
            : "border-[var(--brand-border-light)] bg-white"
        }`}
      >
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary)] text-[13px] font-bold text-white">
          {node.name.charAt(0)}
        </div>
        <p className="mt-2 text-[13px] font-bold">{node.name}</p>
        <p className={`mt-1 text-[11px] font-semibold ${node.active ? "text-emerald-700" : "text-[var(--color-text-muted)]"}`}>
          {node.active ? t("account.affiliation.active") : t("account.affiliation.inactive")} · N{node.level}
        </p>
      </button>
      {node.children && node.children.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 border-t border-[var(--brand-border)] pt-4">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function AffiliateQrCode({ seed }: { seed: string }) {
  const activeCells = useMemo(() => {
    const code = seed || "IWOSAN";
    return new Set(
      Array.from({ length: 36 }, (_, index) => {
        const charCode = code.charCodeAt(index % code.length);
        return (charCode + index * 7) % 5 === 0 || [0, 1, 2, 6, 12, 30, 31, 32, 35].includes(index);
      })
        .map((isActive, index) => (isActive ? index : -1))
        .filter((index) => index >= 0),
    );
  }, [seed]);

  return (
    <div className="grid h-36 w-36 grid-cols-6 gap-1 rounded-[12px] border border-[var(--brand-border)] bg-white p-3">
      {Array.from({ length: 36 }, (_, index) => (
        <span
          key={index}
          className={`rounded-sm ${activeCells.has(index) ? "bg-[var(--brand-primary)]" : "bg-[var(--brand-surface-alt)]"}`}
        />
      ))}
    </div>
  );
}

function AffiliationPage() {
  const { t } = useTranslation();
  const earningLabels = buildEarningLabels(t);
  const affiliateLinkQuery = useAffiliateLink();
  const mlmStatsQuery = useMlmStats();
  const mlmTreeQuery = useMlmTree();
  const mlmEarningsQuery = useMlmEarnings();
  const commissionsQuery = useMyCommissions();
  const leaderboardQuery = useMlmLeaderboard();
  const displayedEarnings = useMemo(
    () => ((commissionsQuery.data ?? []) as BackendCommission[]).map((row) => toAffiliateEarning(row, t)).filter((row): row is AffiliateEarning => Boolean(row)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commissionsQuery.data],
  );
  const displayedLeaderboard = useMemo(
    () => ((leaderboardQuery.data ?? []) as BackendLeaderboardRow[]).map((row) => ({ rank: row.rank ?? 0, name: row.name || t("account.affiliation.defaultLeaderboardMember"), earnings: toAmount(row.earnings) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leaderboardQuery.data],
  );
  const treeRoot = useMemo(() => {
    if (mlmTreeQuery.data && typeof mlmTreeQuery.data === "object" && "id" in mlmTreeQuery.data) {
      return fromBackendNode(mlmTreeQuery.data as BackendMlmNode, t);
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mlmTreeQuery.data]);
  const nodes = useMemo(() => (treeRoot ? flattenTree(treeRoot) : []), [treeRoot]);
  const [selectedNode, setSelectedNode] = useState<AffiliateNode | null>(null);
  const activeNode = selectedNode ?? treeRoot;
  const [copied, setCopied] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const affiliateLink = affiliateLinkQuery.data?.link ?? "";
  const affiliateCode = affiliateLinkQuery.data?.code ?? "";
  const mlmStats = mlmStatsQuery.data as
    | { totalNodes?: number; affiliateLinkClicks?: number; commissionsAmount?: number | string | null }
    | null
    | undefined;
  const liveEarnings = Array.isArray(mlmEarningsQuery.data)
    ? (mlmEarningsQuery.data as BackendMlmEarning[]).reduce((sum, row) => sum + toAmount(row._sum?.amount), 0)
    : null;

  const totals = useMemo(() => {
    const downline = nodes.filter((node) => node.level > 0);
    const active = downline.filter((node) => node.active).length;
    return {
      all: downline.length,
      active,
      level1: downline.filter((node) => node.level === 1).length,
      level2: downline.filter((node) => node.level === 2).length,
      level3: downline.filter((node) => node.level === 3).length,
      earnings: liveEarnings ?? toAmount(mlmStats?.commissionsAmount),
    };
  }, [liveEarnings, mlmStats?.commissionsAmount, nodes]);

  const isLoading = affiliateLinkQuery.isLoading || mlmTreeQuery.isLoading;
  const isError = affiliateLinkQuery.isError || mlmTreeQuery.isError;

  const copyAffiliateLink = async () => {
    try {
      await navigator.clipboard?.writeText(affiliateLink);
      setCopied(true);
      setActionMessage(t("account.affiliation.linkCopied"));
    } catch {
      setActionMessage(t("account.affiliation.copyUnavailable"));
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: t("account.affiliation.shareTitle"), text: t("account.affiliation.shareText"), url: affiliateLink });
        setActionMessage(t("account.affiliation.shareWindowOpened"));
        return;
      }
      await copyAffiliateLink();
    } catch {
      setActionMessage(t("account.affiliation.shareCancelled"));
    }
  };

  if (isLoading) {
    return (
      <AccountLayout title={t("account.affiliation.title")} description={t("account.affiliation.description")}>
        <div className="flex items-center justify-center rounded-[12px] border border-[var(--brand-border-light)] bg-white p-10">
          <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
        </div>
      </AccountLayout>
    );
  }

  if (isError || !treeRoot || !activeNode) {
    return (
      <AccountLayout title={t("account.affiliation.title")} description={t("account.affiliation.description")}>
        <div className="rounded-[12px] border border-red-100 bg-red-50 p-6 text-center text-[14px] text-red-700">
          {t("account.affiliation.loadError")}
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout
      title={t("account.affiliation.title")}
      description={t("account.affiliation.description")}
    >
      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[22px] font-bold">{t("account.affiliation.myLink")}</h2>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <input value={affiliateLink} readOnly className="h-12 min-w-0 flex-1 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-alt)] px-4 text-[13px]" />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(affiliateLink);
                  setCopied(true);
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
              >
                <Copy size={15} /> {t("account.affiliation.copy")}
              </button>
            </div>
            {(copied || actionMessage) && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[13px] text-emerald-800">{actionMessage || t("account.affiliation.linkCopiedShort")}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(affiliateLink)}`, "_blank", "noopener,noreferrer");
                  setActionMessage(t("account.affiliation.whatsappOpening"));
                }}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[12px] font-semibold"
              >
                <MessageCircle size={14} /> {t("account.affiliation.whatsapp")}
              </button>
              <button
                onClick={() => void share()}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[12px] font-semibold"
              >
                <Share2 size={14} /> {t("account.affiliation.socialNetworks")}
              </button>
            </div>
          </div>
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <AffiliateQrCode seed={affiliateCode} />
            <p className="mt-3 text-[13px] font-semibold">{t("account.affiliation.qrCodeLabel")}</p>
            <p className="text-[12px] text-[var(--color-text-muted)]">{t("account.affiliation.code", { code: affiliateCode })}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            [t("account.affiliation.statRegistered"), mlmStats?.totalNodes ?? totals.all],
            [t("account.affiliation.statActive"), totals.active],
            [t("account.affiliation.statLinkClicks"), mlmStats?.affiliateLinkClicks ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{label}</p>
              <p className="mt-2 text-[28px] font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="overflow-x-auto rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[22px] font-bold">{t("account.affiliation.myNetwork")}</h2>
              <p className="text-[13px] text-[var(--color-text-muted)]">
                {t("account.affiliation.levelsSummary", { level1: totals.level1, level2: totals.level2, level3: totals.level3 })}
              </p>
            </div>
            <div className="min-w-[760px] rounded-lg bg-[var(--brand-bg)] p-5">
              <TreeNode node={treeRoot} selectedId={activeNode.id} onSelect={setSelectedNode} />
            </div>
          </section>
          <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[18px] font-bold">{t("account.affiliation.summaryCard")}</h2>
            <div className="mt-4 space-y-3 text-[14px]">
              <p><strong>{t("account.affiliation.name")}</strong> {activeNode.name}</p>
              <p><strong>{t("account.affiliation.level")}</strong> {activeNode.level}</p>
              <p><strong>{t("account.affiliation.registration")}</strong> {activeNode.joinedAt}</p>
              <p><strong>{t("account.affiliation.status")}</strong> {activeNode.active ? t("account.affiliation.active") : t("account.affiliation.inactive")}</p>
              <p><strong>{t("account.affiliation.commissions")}</strong> {activeNode.commissions.toLocaleString("fr-FR")} FCFA</p>
            </div>
          </aside>
        </div>

        <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-bold">{t("account.affiliation.myEarnings")}</h2>
              <p className="mt-1 text-[var(--color-text-muted)]">
                {t("account.affiliation.totalEarned")} <strong className="text-[var(--color-text-primary)]">{totals.earnings.toLocaleString("fr-FR")} FCFA</strong>
              </p>
            </div>
            <Link
              to="/mon-compte/portefeuille"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
            >
              <Wallet size={16} /> {t("account.affiliation.viewWallet")}
            </Link>
          </div>
          <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[13px] text-emerald-800">
            {t("account.affiliation.autoCreditNotice")}
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="bg-[var(--brand-surface-alt)]">
                <tr><th className="p-3">{t("account.affiliation.colDate")}</th><th className="p-3">{t("account.affiliation.colType")}</th><th className="p-3">{t("account.affiliation.colSource")}</th><th className="p-3">{t("account.affiliation.colAmount")}</th><th className="p-3">{t("account.affiliation.colStatus")}</th></tr>
              </thead>
              <tbody>
                {displayedEarnings.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-[13px] text-[var(--color-text-muted)]">{t("account.affiliation.noEarnings")}</td></tr>
                )}
                {displayedEarnings.map((earning) => (
                  <tr key={earning.id} className="border-t border-[var(--brand-border-light)]">
                    <td className="p-3">{earning.date}</td>
                    <td className="p-3">{earningLabels[earning.type]}</td>
                    <td className="p-3">{earning.source}</td>
                    <td className="p-3 font-bold">{earning.amount.toLocaleString("fr-FR")} FCFA</td>
                    <td className="p-3">{earning.status === "paid" ? t("account.affiliation.paid") : t("account.affiliation.pending")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[22px] font-bold">{t("account.affiliation.programRules")}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                [t("account.affiliation.level1Title"), t("account.affiliation.level1Desc")],
                [t("account.affiliation.level2Title"), t("account.affiliation.level2Desc")],
                [t("account.affiliation.level3Title"), t("account.affiliation.level3Desc")],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
                  <p className="font-bold">{title}</p>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">
              {t("account.affiliation.activationNotice")}
            </p>
          </section>
          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[18px] font-bold">{t("account.affiliation.topReferrers")}</h2>
            <div className="mt-4 space-y-3">
              {displayedLeaderboard.length === 0 && (
                <p className="text-[13px] text-[var(--color-text-muted)]">{t("account.affiliation.noLeaderboard")}</p>
              )}
              {displayedLeaderboard.map((row) => (
                <div key={row.rank} className="flex items-center justify-between rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">
                  <span className="font-bold">#{row.rank} {row.name}</span>
                  <span>{row.earnings.toLocaleString("fr-FR")} FCFA</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AccountLayout>
  );
}
