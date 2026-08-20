import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let url = process.env['DATABASE_URL'];
if (url && !url.includes('connection_limit')) {
  const separator = url.includes('?') ? '&' : '?';
  url = `${url}${separator}connection_limit=3&pool_timeout=0`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = prisma;
