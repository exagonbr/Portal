import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/queue/stats
 * Retorna estatísticas da fila de jobs
 */
export async function GET(req: Request) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Conta jobs por status
    const pendingCount = await prisma.queueJob.count({
      where: { status: 'pending' }
    });
    
    const processingCount = await prisma.queueJob.count({
      where: { status: 'processing' }
    });
    
    const completedCount = await prisma.queueJob.count({
      where: { status: 'completed' }
    });
    
    const failedCount = await prisma.queueJob.count({
      where: { status: 'failed' }
    });
    
    const delayedCount = await prisma.queueJob.count({
      where: { 
        status: 'pending',
        delay: { not: null }
      }
    });
    
    // Total geral
    const totalCount = await prisma.queueJob.count();

    return NextResponse.json({
      success: true,
      data: {
        pending: pendingCount,
        processing: processingCount,
        completed: completedCount,
        failed: failedCount,
        delayed: delayedCount,
        total: totalCount
      }
    });
  } catch (error) {
    console.error('[API] Erro ao obter estatísticas da fila:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao obter estatísticas da fila' },
      { status: 500 }
    );
  }
} 