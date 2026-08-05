-- AlterTable: hierarchy support on Taxonomy (parent/child, self-relation)
ALTER TABLE "Taxonomy" ADD COLUMN "parentId" TEXT;
ALTER TABLE "Taxonomy" ADD CONSTRAINT "Taxonomy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Taxonomy_parentId_idx" ON "Taxonomy"("parentId");

-- AlterTable: Product.category moves from the fixed MedCategory enum to a free
-- taxonomy slug (Taxonomy rows with scope = 'PRODUCT_CATEGORY'), so the site's
-- product category tree can be edited from the admin panel instead of requiring
-- a schema migration for every catalog change. The USING clause preserves each
-- row's current enum value as text; a follow-up data script remaps those old
-- values to the new taxonomy slugs (see prisma/scripts/seedProductTaxonomy.mjs).
ALTER TABLE "Product" ALTER COLUMN "category" TYPE TEXT USING "category"::TEXT;

-- The enum is now unused (no column references it) — dropped rather than left
-- as dead schema, since the category system it backed has been fully replaced.
DROP TYPE "MedCategory";
