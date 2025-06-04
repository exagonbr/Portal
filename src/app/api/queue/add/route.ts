import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/queue/add
 * Adiciona um novo job à fila
 */
export async function POST(req: Request) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obtém dados do job
    const body = await req.json();
    const { type, data, priority = 0, delay = 0, maxAttempts = 3, timeout = 30000 } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, message: 'Tipo e dados do job são obrigatórios' },
        { status: 400 }
      );
    }

    // Calcula data de delay, se houver
    const delayDate = delay > 0 ? new Date(Date.now() + delay) : null;

    // Cria o job no banco de dados
    const job = await prisma.queueJob.create({
      data: {
        type,
        data: typeof data === 'string' ? data : JSON.stringify(data),
        priority,
        maxAttempts,
        attempts: 0,
        status: 'pending',
        delay: delayDate,
        timeout,
        createdAt: new Date(),
        createdBy: session.user?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { jobId: job.id },
      message: 'Job adicionado com sucesso'
    });
  } catch (error) {
    console.error('[API] Erro ao adicionar job à fila:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao adicionar job à fila' },
      { status: 500 }
    );
  }
} 