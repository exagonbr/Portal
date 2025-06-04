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
 * GET /api/queue/next
 * Retorna os próximos jobs da fila para processamento
 */
export async function GET(req: Request) {
  try {
    // Verifica autenticação (opcional, dependendo da implementação)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Limite de jobs a retornar
    const limit = 5;
    
    // Busca jobs pendentes ordenados por prioridade e data de criação
    const jobs = await prisma.queueJob.findMany({
      where: {
        status: 'pending',
        // Opcional: verificar se o delay já passou
        OR: [
          { delay: null },
          { delay: { lte: new Date() } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit
    }) as QueueJob[];

    return NextResponse.json({
      success: true,
      data: jobs.map((job: QueueJob) => ({
        ...job,
        data: typeof job.data === 'string' ? JSON.parse(job.data) : job.data
      }))
    });
  } catch (error) {
    console.error('[API] Erro ao buscar jobs da fila:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar jobs da fila' },
      { status: 500 }
    );
  }
} 