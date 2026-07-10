import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, MessageCircle, Share2, Wallet } from "lucide-react";
import {
  affiliateEarnings,
  affiliateLeaderboard,
  affiliateProfile,
  affiliateTree,
} from "@/data/affiliate";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAffiliateLink, useMlmEarnings, useMlmStats, useMlmTree } from "@/hooks/useMlmApi";
import type { AffiliateEarning, AffiliateNode } from "@/types";

export const Route = createFileRoute("/mon-compte/affiliation")({
  head: () => ({ meta: [{ title: "Affiliation - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={["user", "researcher", "professional", "admin", "super_admin"]}>
      <AffiliationPage />
    </ProtectedRoute>
  ),
});

const earningLabels: Record<AffiliateEarning["type"], string> = {
  direct_sale: "Vente directe",
  level_2: "Commission niveau 2",
  level_3: "Commission niveau 3",
};

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

const toAmount = (value: unknown) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

function fromBackendNode(node: BackendMlmNode): AffiliateNode {
  return {
    id: node.id,
    name: `${node.user?.firstName ?? "Membre"} ${node.user?.lastName ?? ""}`.trim(),
    level: Math.min(Math.max(node.level, 0), 3) as AffiliateNode["level"],
    joinedAt: node.createdAt ? new Date(node.createdAt).toLocaleDateString("fr-FR") : "-",
    active: node.user?.isActive ?? true,
    commissions: toAmount(node.totalEarnings),
    children: node.children?.map(fromBackendNode),
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
          {node.active ? "Actif" : "Inactif"} · N{node.level}
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
  const affiliateLinkQuery = useAffiliateLink();
  const mlmStatsQuery = useMlmStats();
  const mlmTreeQuery = useMlmTree();
  const mlmEarningsQuery = useMlmEarnings();
  const treeRoot = useMemo(() => {
    if (mlmTreeQuery.data && typeof mlmTreeQuery.data === "object" && "id" in mlmTreeQuery.data) {
      return fromBackendNode(mlmTreeQuery.data as BackendMlmNode);
    }
    return affiliateTree;
  }, [mlmTreeQuery.data]);
  const nodes = useMemo(() => flattenTree(treeRoot), [treeRoot]);
  const [selectedNode, setSelectedNode] = useState<AffiliateNode | null>(null);
  const activeNode = selectedNode ?? treeRoot;
  const [copied, setCopied] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const affiliateLink = affiliateLinkQuery.data?.link ?? affiliateProfile.link;
  const affiliateCode = affiliateLinkQuery.data?.code ?? affiliateProfile.code;
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
      earnings: liveEarnings ?? (toAmount(mlmStats?.commissionsAmount) || affiliateEarnings.reduce((sum, earning) => sum + earning.amount, 0)),
    };
  }, [liveEarnings, mlmStats?.commissionsAmount, nodes]);

  const copyAffiliateLink = async () => {
    try {
      await navigator.clipboard?.writeText(affiliateLink);
      setCopied(true);
      setActionMessage("Lien copie dans le presse-papiers.");
    } catch {
      setActionMessage("Copie automatique indisponible. Selectionnez le lien puis copiez-le manuellement.");
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "IWOSAN", text: "Rejoignez-moi sur IWOSAN", url: affiliateLink });
        setActionMessage("Fenetre de partage ouverte.");
        return;
      }
      await copyAffiliateLink();
    } catch {
      setActionMessage("Partage annule ou indisponible sur cet appareil.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-10">
          <AccountBackLink />
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">MLM & affiliation</p>
          <h1 className="mt-2 text-[34px] md:text-[44px]">Mon programme d'affiliation</h1>
          <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
            Suivez votre lien de parrainage, vos filleuls et les commissions generees par votre reseau.
          </p>
        </div>
      </section>

      <section className="container-iwosan space-y-8 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[22px] font-bold">Mon lien de parrainage</h2>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <input value={affiliateLink} readOnly className="h-12 min-w-0 flex-1 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-alt)] px-4 text-[13px]" />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(affiliateLink);
                  setCopied(true);
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
              >
                <Copy size={15} /> Copier
              </button>
            </div>
            {(copied || actionMessage) && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[13px] text-emerald-800">{actionMessage || "Lien copie."}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(affiliateLink)}`, "_blank", "noopener,noreferrer");
                  setActionMessage("Ouverture du partage WhatsApp.");
                }}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[12px] font-semibold"
              >
                <MessageCircle size={14} /> WhatsApp
              </button>
              <button
                onClick={() => void share()}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[12px] font-semibold"
              >
                <Share2 size={14} /> Reseaux sociaux
              </button>
            </div>
          </div>
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <AffiliateQrCode seed={affiliateCode} />
            <p className="mt-3 text-[13px] font-semibold">QR code d'affiliation</p>
            <p className="text-[12px] text-[var(--color-text-muted)]">Code : {affiliateCode}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Inscrits", mlmStats?.totalNodes ?? totals.all],
            ["Actifs", totals.active],
            ["Taux conversion", `${affiliateProfile.conversionRate}%`],
            ["Clics lien", mlmStats?.affiliateLinkClicks ?? affiliateProfile.clicks],
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
              <h2 className="text-[22px] font-bold">Mon reseau</h2>
              <p className="text-[13px] text-[var(--color-text-muted)]">
                N1: {totals.level1} · N2: {totals.level2} · N3: {totals.level3}
              </p>
            </div>
            <div className="min-w-[760px] rounded-lg bg-[var(--brand-bg)] p-5">
              <TreeNode node={treeRoot} selectedId={activeNode.id} onSelect={setSelectedNode} />
            </div>
          </section>
          <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[18px] font-bold">Fiche resume</h2>
            <div className="mt-4 space-y-3 text-[14px]">
              <p><strong>Nom :</strong> {activeNode.name}</p>
              <p><strong>Niveau :</strong> {activeNode.level}</p>
              <p><strong>Inscription :</strong> {activeNode.joinedAt}</p>
              <p><strong>Statut :</strong> {activeNode.active ? "Actif" : "Inactif"}</p>
              <p><strong>Commissions :</strong> {activeNode.commissions.toLocaleString("fr-FR")} FCFA</p>
            </div>
          </aside>
        </div>

        <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-bold">Mes gains d'affiliation</h2>
              <p className="mt-1 text-[var(--color-text-muted)]">
                Total gagne : <strong className="text-[var(--color-text-primary)]">{totals.earnings.toLocaleString("fr-FR")} FCFA</strong>
              </p>
            </div>
            <Link
              to="/mon-compte/portefeuille"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
            >
              <Wallet size={16} /> Voir mon portefeuille
            </Link>
          </div>
          <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[13px] text-emerald-800">
            Les commissions approuvees sont creditees automatiquement dans votre portefeuille IWOSAN.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="bg-[var(--brand-surface-alt)]">
                <tr><th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Source</th><th className="p-3">Montant</th><th className="p-3">Statut</th></tr>
              </thead>
              <tbody>
                {affiliateEarnings.map((earning) => (
                  <tr key={earning.id} className="border-t border-[var(--brand-border-light)]">
                    <td className="p-3">{earning.date}</td>
                    <td className="p-3">{earningLabels[earning.type]}</td>
                    <td className="p-3">{earning.source}</td>
                    <td className="p-3 font-bold">{earning.amount.toLocaleString("fr-FR")} FCFA</td>
                    <td className="p-3">{earning.status === "paid" ? "Verse" : "En attente"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[22px] font-bold">Regles du programme</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["Niveau 1", "5% sur ventes directes"],
                ["Niveau 2", "3% sur reseau indirect"],
                ["Niveau 3", "2% sur reseau profond"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
                  <p className="font-bold">{title}</p>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">
              Activation : compte verifie, KYC approuve et solde minimum atteint avant retrait.
            </p>
          </section>
          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="text-[18px] font-bold">Top affilies du mois</h2>
            <div className="mt-4 space-y-3">
              {affiliateLeaderboard.map((row) => (
                <div key={row.rank} className="flex items-center justify-between rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">
                  <span className="font-bold">#{row.rank} {row.name}</span>
                  <span>{row.earnings.toLocaleString("fr-FR")} FCFA</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
