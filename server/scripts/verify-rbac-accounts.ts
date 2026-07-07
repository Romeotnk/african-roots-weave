import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const emails = [
  "super.admin@iwosan.com",
  "admin1@iwosan.com",
  "moderator@iwosan.com",
  "editor@iwosan.com",
  "pro1@iwosan.com",
  "researcher@iwosan.com",
  "user1@iwosan.com",
];

const users = await prisma.user.findMany({
  where: { email: { in: emails } },
  select: {
    email: true,
    role: true,
    adminSubRole: true,
    isResearcher: true,
    isEmailVerified: true,
    kycStatus: true,
    _count: {
      select: {
        products: true,
        purchases: true,
        sales: true,
        notifications: true,
        sentMessages: true,
        receivedMessages: true,
      },
    },
  },
  orderBy: { email: "asc" },
});

console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
