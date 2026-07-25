-- AlterEnum
ALTER TYPE "ReviewTarget" ADD VALUE 'FORMATION';

-- DropIndex
DROP INDEX "User_avatarUrl_idx";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "recipeData" JSONB;

-- AlterTable
ALTER TABLE "Formation" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'XOF',
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "instructorBio" TEXT,
ADD COLUMN     "learnings" TEXT[],
ADD COLUMN     "level" TEXT,
ADD COLUMN     "prerequisites" TEXT[],
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "PlantMonograph" ADD COLUMN     "family" TEXT,
ADD COLUMN     "indications" TEXT[],
ADD COLUMN     "medicinalProperties" JSONB,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "precautions" TEXT[],
ADD COLUMN     "preparations" TEXT[],
ADD COLUMN     "references" TEXT[],
ADD COLUMN     "region" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "therapeuticCategory" TEXT;

-- CreateTable
CREATE TABLE "FormationModule" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormationModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormationLesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT,
    "type" TEXT NOT NULL DEFAULT 'video',
    "order" INTEGER NOT NULL DEFAULT 0,
    "contentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormationLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormationModule_formationId_idx" ON "FormationModule"("formationId");

-- CreateIndex
CREATE INDEX "FormationLesson_moduleId_idx" ON "FormationLesson"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Formation_slug_key" ON "Formation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PlantMonograph_slug_key" ON "PlantMonograph"("slug");

-- AddForeignKey
ALTER TABLE "FormationModule" ADD CONSTRAINT "FormationModule_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormationLesson" ADD CONSTRAINT "FormationLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "FormationModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

