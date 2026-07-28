-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "sellerAcknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "sellerRefundNote" TEXT;
