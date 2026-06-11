import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const result = await prisma.$queryRaw`select 1 as ok`;
  console.log('DB_OK', result);
} catch (error) {
  console.error('DB_ERR');
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
