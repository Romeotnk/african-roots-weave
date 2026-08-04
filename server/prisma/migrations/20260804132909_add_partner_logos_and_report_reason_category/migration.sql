-- CreateEnum
CREATE TYPE "ReportReasonCategory" AS ENUM ('FRAUDULENT_CONTENT', 'PROHIBITED_ITEM', 'SCAM', 'INAPPROPRIATE_CONTENT', 'SPAM', 'OTHER');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN "reasonCategory" "ReportReasonCategory";

-- CreateTable
CREATE TABLE "PartnerLogo" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerLogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerLogo_isActive_order_idx" ON "PartnerLogo"("isActive", "order");

-- Consistent with the project-wide RLS baseline (20260802095108_enable_row_level_security):
-- deny anon/authenticated PostgREST access by default; the app's Prisma client
-- connects as the postgres role, which bypasses RLS.
ALTER TABLE "public"."PartnerLogo" ENABLE ROW LEVEL SECURITY;
