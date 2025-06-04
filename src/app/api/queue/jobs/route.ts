import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Interface para o objeto QueueJob
interface QueueJob {
  id: string;
  type: string;
  data: string | any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  delay?: Date | null;
  createdAt: Date;
  processedAt?: Date | null;
  completedAt?: Date | null;
  failedAt?: Date | null;
  error?: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdBy?: string | null;
  timeout?: number;
}

/**
 * GET /api/queue/jobs
 * Lista jobs da fila com filtros e paginação
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

    // Obtém parâmetros da URL
    const url = new URL(req.url);
    const status = url.searchParams.get('status') as 'pending' | 'processing' | 'completed' | 'failed' | undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const type = url.searchParams.get('type');

    // Constrói query
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    // Busca jobs
    const jobs = await prisma.queueJob.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    }) as QueueJob[];

    // Conta total para paginação
    const total = await prisma.queueJob.count({ where });

    return NextResponse.json({
      success: true,
      data: jobs.map((job: QueueJob) => ({
        ...job,
        data: typeof job.data === 'string' ? JSON.parse(job.data) : job.data
      })),
      meta: {
        total,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('[API] Erro ao listar jobs:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao listar jobs' },
      { status: 500 }
    );
  }
} 