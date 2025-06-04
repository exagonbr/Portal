import { PrismaClient } from '@prisma/client';

// Adiciona tipagem estendida para o objeto PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// Evita múltiplas instâncias durante o hot reload no desenvolvimento
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Se não estiver em produção, mantenha a conexão do Prisma viva
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 