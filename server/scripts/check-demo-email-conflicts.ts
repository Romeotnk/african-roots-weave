import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoEmails = [
  "admin@iwosan.com",
  "researcher@iwosan.com",
  ...Array.from({ length: 12 }, (_, index) => `user${index + 1}@iwosan.com`),
  ...Array.from({ length: 5 }, (_, index) => `pro${index + 1}@iwosan.com`),
];

try {
  const conflicts = await prisma.user.findMany({
    where: { email: { in: demoEmails } },
    select: { email: true, role: true },
    orderBy: { email: "asc" },
  });

  console.log(JSON.stringify(conflicts, null, 2));
} finally {
  await prisma.$disconnect();
}
