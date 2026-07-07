import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tables = [
  "User",
  "ProfessionalProfile",
  "Product",
  "Article",
  "PlantMonograph",
  "Question",
  "Event",
  "Formation",
  "Order",
  "SiteConfig",
  "NewsletterSubscriber",
  "Message",
  "HomeBanner",
  "AdSpace",
  "_prisma_migrations",
] as const;

try {
  const summary: Record<string, number | "missing"> = {};

  for (const table of tables) {
    const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `select count(*)::bigint as count from "${table}"`,
    ).catch(() => null);

    summary[table] = result ? Number(result[0]?.count ?? 0) : "missing";
  }

  console.log(JSON.stringify(summary, null, 2));
} finally {
  await prisma.$disconnect();
}
