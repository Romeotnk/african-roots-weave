import type { Prisma, PrismaClient } from "@prisma/client";

// Defaults match the platform's historical hardcoded rates. Values are
// stored in SiteConfig as human-entered percentages (e.g. "10" for 10%),
// set via PUT /admin/commissions/config, and read back here as fractions.
const defaults = { global: 0.1, level1: 0.03, level2: 0.02, level3: 0.01 };

type CommissionRates = typeof defaults;

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

  return {
    global: readPercent("commission.global", defaults.global),
    level1: readPercent("commission.level1", defaults.level1),
    level2: readPercent("commission.level2", defaults.level2),
    level3: readPercent("commission.level3", defaults.level3),
  };
};
