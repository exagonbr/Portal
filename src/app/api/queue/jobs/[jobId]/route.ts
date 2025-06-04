import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/queue/jobs/[jobId]
 * Obtém detalhes de um job específico
 */
export async function GET(
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

    // Formata os dados do job
    const formattedJob = {
      ...job,
      data: typeof job.data === 'string' ? JSON.parse(job.data) : job.data
    };

    return NextResponse.json({
      success: true,
      data: formattedJob
    });
  } catch (error) {
    console.error('[API] Erro ao obter detalhes do job:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao obter detalhes do job' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/queue/jobs/[jobId]
 * Remove um job da fila
 */
export async function DELETE(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    // Verifica autenticação e permissões de admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { jobId } = params;

    // Remove o job
    await prisma.queueJob.delete({
      where: { id: jobId }
    });

    return NextResponse.json({
      success: true,
      message: 'Job removido com sucesso'
    });
  } catch (error) {
    console.error('[API] Erro ao remover job:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao remover job' },
      { status: 500 }
    );
  }
} 