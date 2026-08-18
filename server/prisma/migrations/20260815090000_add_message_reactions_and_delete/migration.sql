-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "reactions" JSONB,
ADD COLUMN     "deletedAt" TIMESTAMP(3);
