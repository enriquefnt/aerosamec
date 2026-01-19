import { PrismaClient } from '@prisma/client'

// Configuración global de Prisma (Como DB en Laravel)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

if (typeof window === 'undefined') {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma
  }
}