-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hiddenReason" TEXT;

-- AlterTable
ALTER TABLE "ForumComment" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;
