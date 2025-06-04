import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * PATCH /api/queue/[jobId]/failed
 * Marca um job como falhado
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
    const body = await req.json();
    const { error } = body;

    // Obtém job atual para verificar número de tentativas
    const currentJob = await prisma.queueJob.findUnique({
      where: { id: jobId }
    });

    if (!currentJob) {
      return NextResponse.json(
        { success: false, message: 'Job não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se atingiu o número máximo de tentativas
    const isFinalFailure = currentJob.attempts >= currentJob.maxAttempts;
    
    // Atualiza o job
    const job = await prisma.queueJob.update({
      where: { id: jobId },
      data: {
        status: isFinalFailure ? 'failed' : 'pending',
        failedAt: isFinalFailure ? new Date() : null,
        error: error || 'Erro desconhecido'
      }
    });

    return NextResponse.json({
      success: true,
      data: job,
      message: isFinalFailure 
        ? 'Job marcado como falhado definitivamente' 
        : 'Job marcado para nova tentativa'
    });
  } catch (error) {
    console.error('[API] Erro ao atualizar status do job:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar status do job' },
      { status: 500 }
    );
  }
} 