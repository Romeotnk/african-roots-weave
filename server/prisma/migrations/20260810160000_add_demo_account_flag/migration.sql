-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isDemoAccount" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: mark the existing prisma/seed.ts sample accounts (all created
-- with an @iwosan.com address) so the demo-hide toggle has something to
-- filter on immediately, without needing a manual pass first.
UPDATE "User" SET "isDemoAccount" = true WHERE "email" LIKE '%@iwosan.com';
