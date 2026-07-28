-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "featuredUntil" TIMESTAMP(3),
ADD COLUMN     "isUrgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "urgentUntil" TIMESTAMP(3);
