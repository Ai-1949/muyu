import { PrismaClient } from '@prisma/client';

/**
 * Prisma 单例：避免开发环境下热重载创建过多连接
 * @returns {PrismaClient}
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
