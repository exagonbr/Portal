import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/queue/clean
 * Remove jobs antigos de acordo com critérios
 */
export async function POST(req: Request) {
  try {
    // Verifica autenticação e permissões de admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obtém parâmetros do body
    const body = await req.json();
    const { status, olderThan } = body;

    if (!status || !['completed', 'failed'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status inválido. Use completed ou failed' },
        { status: 400 }
      );
    }

    // Cria o filtro de data
    const dateFilter = olderThan ? new Date(olderThan) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias atrás por padrão

    // Constrói o where de acordo com o status
    const where: any = { status };
    
    if (status === 'completed') {
      where.completedAt = { lt: dateFilter };
    } else if (status === 'failed') {
      where.failedAt = { lt: dateFilter };
    }

    // Remove os jobs
    const result = await prisma.queueJob.deleteMany({ where });

    return NextResponse.json({
      success: true,
      data: { cleaned: result.count },
      message: `${result.count} jobs removidos com sucesso`
    });
  } catch (error) {
    console.error('[API] Erro ao limpar jobs:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao limpar jobs' },
      { status: 500 }
    );
  }
} 