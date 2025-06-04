import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * PATCH /api/queue/[jobId]/completed
 * Marca um job como completado
 */
export async function PATCH(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { jobId } = params;

    // Atualiza o job
    const job = await prisma.queueJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job marcado como completado'
    });
  } catch (error) {
    console.error('[API] Erro ao atualizar status do job:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar status do job' },
      { status: 500 }
    );
  }
} 