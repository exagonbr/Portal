import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/queue/jobs/[jobId]/retry
 * Recoloca um job falhado na fila para nova tentativa
 */
export async function POST(
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

    // Busca o job
    const job = await prisma.queueJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job não encontrado' },
        { status: 404 }
      );
    }

    // Atualiza o job para tentar novamente
    const updatedJob = await prisma.queueJob.update({
      where: { id: jobId },
      data: {
        status: 'pending',
        failedAt: null,
        processedAt: null,
        completedAt: null,
        error: null,
        // Reinicia tentativas se já atingiu o máximo
        attempts: job.attempts >= job.maxAttempts ? 0 : job.attempts
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Job colocado para nova tentativa'
    });
  } catch (error) {
    console.error('[API] Erro ao retentar job:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao retentar job' },
      { status: 500 }
    );
  }
} 