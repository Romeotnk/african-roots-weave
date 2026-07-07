ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR';

DO $$
BEGIN
  CREATE TYPE "AdminSubRole" AS ENUM ('MODERATOR', 'EDITOR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "adminSubRole" "AdminSubRole";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isResearcher" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "banExpiresAt" TIMESTAMP(3);

UPDATE "User" SET "isResearcher" = true WHERE "role" = 'RESEARCHER';
UPDATE "User" SET "adminSubRole" = 'MODERATOR' WHERE "role" = 'MODERATOR' AND "adminSubRole" IS NULL;

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "targetId" TEXT,
  "targetType" TEXT,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AuditLog_userId_fkey'
  ) THEN
    ALTER TABLE "AuditLog"
      ADD CONSTRAINT "AuditLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "User_adminSubRole_idx" ON "User"("adminSubRole");
CREATE INDEX IF NOT EXISTS "User_isResearcher_idx" ON "User"("isResearcher");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_targetId_targetType_idx" ON "AuditLog"("targetId", "targetType");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);
