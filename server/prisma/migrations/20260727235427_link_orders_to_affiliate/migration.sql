-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "affiliateLinkId" TEXT;

-- CreateIndex
CREATE INDEX "Order_affiliateLinkId_idx" ON "Order"("affiliateLinkId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_affiliateLinkId_fkey" FOREIGN KEY ("affiliateLinkId") REFERENCES "AffiliateLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
