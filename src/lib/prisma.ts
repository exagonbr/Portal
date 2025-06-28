import { PrismaClient } from '@prisma/client'

declare global {
  // allow global __prisma so HMR doesn't create multiple clients
  var __prisma: PrismaClient | undefined
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
