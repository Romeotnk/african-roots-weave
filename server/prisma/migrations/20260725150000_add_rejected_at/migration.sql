-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "rejectedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "rejectedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Formation" ADD COLUMN     "rejectedAt" TIMESTAMP(3);
