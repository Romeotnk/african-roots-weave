-- Merge MODERATOR/EDITOR into ADMIN and SUPER_ADMIN, and RESEARCHER into
-- PROFESSIONAL. ADMIN already held every permission MODERATOR/EDITOR had,
-- and PROFESSIONAL already held every permission RESEARCHER had, so this is
-- a pure role-surface simplification: fewer roles, no capability lost.

-- 1. Reassign existing users before the enum values disappear.
UPDATE "User" SET "role" = 'ADMIN' WHERE "role" IN ('MODERATOR', 'EDITOR');
UPDATE "User" SET "role" = 'PROFESSIONAL' WHERE "role" = 'RESEARCHER';

-- 2. Drop the now-orphaned per-role permission grants for roles that will
-- no longer exist.
DELETE FROM "RolePermission" WHERE "role" IN ('MODERATOR', 'EDITOR', 'RESEARCHER');

-- 3. Recreate the Role enum without MODERATOR/EDITOR/RESEARCHER. Postgres
-- has no direct "remove enum value" — swap in a new type.
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'PROFESSIONAL', 'USER');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

ALTER TABLE "RolePermission" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");

DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

-- 4. Drop adminSubRole (the MODERATOR/EDITOR sub-marker) and isResearcher
-- (the standalone researcher flag) — both concepts are gone.
DROP INDEX IF EXISTS "User_adminSubRole_idx";
DROP INDEX IF EXISTS "User_isResearcher_idx";
ALTER TABLE "User" DROP COLUMN IF EXISTS "adminSubRole";
ALTER TABLE "User" DROP COLUMN IF EXISTS "isResearcher";
DROP TYPE IF EXISTS "AdminSubRole";
