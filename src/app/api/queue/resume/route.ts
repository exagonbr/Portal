import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isQueuePaused } from '../pause/route';

// Acessa a variável de controle do estado da fila
declare module '../pause/route' {
  export let queuePaused: boolean;
}

/**
 * POST /api/queue/resume
 * Retoma o processamento da fila
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

    // Altera a variável do módulo
    const pauseModule = await import('../pause/route');
    (pauseModule as any).queuePaused = false;
    
    // Opcional: registrar em algum lugar que a fila foi retomada
    await prisma.systemConfig.upsert({
      where: { key: 'queue_paused' },
      update: { value: 'false' },
      create: { key: 'queue_paused', value: 'false' }
    });

    return NextResponse.json({
      success: true,
      message: 'Processamento da fila retomado'
    });
  } catch (error) {
    console.error('[API] Erro ao retomar fila:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao retomar fila' },
      { status: 500 }
    );
  }
} 