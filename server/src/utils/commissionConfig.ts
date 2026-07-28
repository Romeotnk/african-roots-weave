import type { Prisma, PrismaClient } from "@prisma/client";

// Defaults match the platform's historical hardcoded rates. Values are
// stored in SiteConfig as human-entered percentages (e.g. "10" for 10%),
// set via PUT /admin/commissions/config, and read back here as fractions.
const defaults = { global: 0.1, level1: 0.03, level2: 0.02, level3: 0.01, affiliate: 0.05 };

const CATEGORY_KEY_PREFIX = "commission.category.";

export type CommissionRates = {
  global: number;
  level1: number;
  level2: number;
  level3: number;
  affiliate: number;
  byCategory: Record<string, number>;
};

type TxClient = PrismaClient | Prisma.TransactionClient;

export const getCommissionRates = async (tx: TxClient): Promise<CommissionRates> => {
  const rows = await tx.siteConfig.findMany({ where: { key: { startsWith: "commission." } } });
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  const readPercent = (key: string, fallback: number) => {
    const raw = byKey.get(key);
    if (raw === undefined) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed / 100 : fallback;
  };

  const byCategory: Record<string, number> = {};
  for (const row of rows) {
    if (!row.key.startsWith(CATEGORY_KEY_PREFIX) || !row.value.trim()) continue;
    const parsed = Number(row.value);
    if (Number.isFinite(parsed)) byCategory[row.key.slice(CATEGORY_KEY_PREFIX.length)] = parsed / 100;
  }

  return {
    global: readPercent("commission.global", defaults.global),
    level1: readPercent("commission.level1", defaults.level1),
    level2: readPercent("commission.level2", defaults.level2),
    level3: readPercent("commission.level3", defaults.level3),
    affiliate: readPercent("commission.affiliate", defaults.affiliate),
    byCategory,
  };
};

/**
 * Resolution order for a sale's commission rate: an explicit per-product
 * rate wins, then the seller's own negotiated default, then a rate set for
 * the product's category, and finally the platform-wide default.
 */
export const resolveProductCommissionRate = (
  rates: CommissionRates,
  product: { commissionRate: number | null; category: string },
  sellerDefaultRate?: number | null,
): number => product.commissionRate ?? sellerDefaultRate ?? rates.byCategory[product.category] ?? rates.global;
