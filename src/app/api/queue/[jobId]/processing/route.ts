import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * PATCH /api/queue/[jobId]/processing
 * Marca um job como em processamento
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
        status: 'processing',
        processedAt: new Date(),
        attempts: { increment: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job marcado como em processamento'
    });
  } catch (error) {
    console.error('[API] Erro ao atualizar status do job:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar status do job' },
      { status: 500 }
    );
  }
} 