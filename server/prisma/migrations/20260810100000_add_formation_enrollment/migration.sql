-- CreateTable
CREATE TABLE IF NOT EXISTS "FormationEnrollment" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pricePaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "monerooTransactionId" TEXT,
    "completedLessonIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormationEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FormationEnrollment_formationId_userId_key" ON "FormationEnrollment"("formationId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FormationEnrollment_userId_idx" ON "FormationEnrollment"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FormationEnrollment_formationId_idx" ON "FormationEnrollment"("formationId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FormationEnrollment_formationId_fkey'
  ) THEN
    ALTER TABLE "FormationEnrollment"
      ADD CONSTRAINT "FormationEnrollment_formationId_fkey"
      FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FormationEnrollment_userId_fkey'
  ) THEN
    ALTER TABLE "FormationEnrollment"
      ADD CONSTRAINT "FormationEnrollment_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
