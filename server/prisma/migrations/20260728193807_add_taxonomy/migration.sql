-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Taxonomy_scope_idx" ON "Taxonomy"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "Taxonomy_scope_slug_key" ON "Taxonomy"("scope", "slug");
