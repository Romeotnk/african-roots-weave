import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const migrationName = "20260706000000_init";

const expectedTables = [
  "AdSpace",
  "Answer",
  "Article",
  "Bid",
  "CartItem",
  "Commission",
  "Coupon",
  "EmailVerificationToken",
  "Event",
  "EventRegistration",
  "Formation",
  "ForumComment",
  "HomeBanner",
  "MLMNode",
  "Message",
  "NewsletterSubscriber",
  "Notification",
  "Order",
  "PasswordResetToken",
  "PlantMonograph",
  "Product",
  "ProfessionalProfile",
  "Question",
  "RefreshToken",
  "Report",
  "Review",
  "SiteConfig",
  "Subscription",
  "Ticket",
  "TicketMessage",
  "User",
  "Vote",
  "WalletTransaction",
];

try {
  const existingTables = await prisma.$queryRaw<{ tablename: string }[]>`
    select tablename
    from pg_tables
    where schemaname = 'public'
  `;
  const existingNames = new Set(existingTables.map((table) => table.tablename));
  const missingTables = expectedTables.filter((table) => !existingNames.has(table));

  if (missingTables.length > 0) {
    throw new Error(`Cannot mark migration as applied. Missing tables: ${missingTables.join(", ")}`);
  }

  await prisma.$executeRawUnsafe(`
    create table if not exists "_prisma_migrations" (
      id varchar(36) primary key,
      checksum varchar(64) not null,
      finished_at timestamptz,
      migration_name varchar(255) not null,
      logs text,
      rolled_back_at timestamptz,
      started_at timestamptz not null default now(),
      applied_steps_count integer not null default 0
    )
  `);

  const existingMigration = await prisma.$queryRaw<{ id: string }[]>`
    select id
    from "_prisma_migrations"
    where migration_name = ${migrationName}
    limit 1
  `;

  if (existingMigration.length > 0) {
    console.log(`Migration already marked as applied: ${migrationName}`);
  } else {
    const scriptDir = dirname(fileURLToPath(import.meta.url));
    const migrationPath = join(scriptDir, "..", "prisma", "migrations", migrationName, "migration.sql");
    const migrationSql = await readFile(migrationPath, "utf8");
    const checksum = createHash("sha256").update(migrationSql).digest("hex");
    const now = new Date();

    await prisma.$executeRaw`
      insert into "_prisma_migrations" (
        id,
        checksum,
        finished_at,
        migration_name,
        logs,
        rolled_back_at,
        started_at,
        applied_steps_count
      )
      values (
        ${randomUUID()},
        ${checksum},
        ${now},
        ${migrationName},
        null,
        null,
        ${now},
        1
      )
    `;

    console.log(`Migration marked as applied: ${migrationName}`);
  }
} finally {
  await prisma.$disconnect();
}
