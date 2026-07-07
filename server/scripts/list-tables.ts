import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    select tablename
    from pg_tables
    where schemaname = 'public'
    order by tablename
  `;

  console.log(JSON.stringify(tables, null, 2));
} finally {
  await prisma.$disconnect();
}
