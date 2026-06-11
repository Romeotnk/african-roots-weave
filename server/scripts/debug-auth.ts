import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { in: ['admin@iwosan.com', 'user1@iwosan.com', 'fixcheck2+1781188952579@example.com'] } },
    select: { id: true, email: true, passwordHash: true, isActive: true, isBanned: true, firstName: true, lastName: true },
  });

  for (const user of users) {
    const ok = await bcrypt.compare('Admin@123', user.passwordHash);
    console.log('USER', user.email, { ok, isActive: user.isActive, isBanned: user.isBanned, hashLen: user.passwordHash.length });
  }

  console.log('ALL_USERS', users.length);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
