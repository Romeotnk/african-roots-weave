ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

CREATE INDEX IF NOT EXISTS "User_avatarUrl_idx" ON "User"("avatarUrl");
