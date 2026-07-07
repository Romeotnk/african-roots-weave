import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const roles = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
    orderBy: { role: "asc" },
  });

  console.log(JSON.stringify(roles, null, 2));
} finally {
  await prisma.$disconnect();
}
