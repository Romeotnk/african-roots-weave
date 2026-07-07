import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "User_avatarUrl_idx" ON "User"("avatarUrl")');
  console.log("avatarUrl migration ok");
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
