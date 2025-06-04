import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Variável global para controlar o estado da fila
let queuePaused = false;

/**
 * POST /api/queue/pause
 * Pausa o processamento da fila
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

    // Marca a fila como pausada
    queuePaused = true;

    // Opcional: registrar em algum lugar que a fila foi pausada
    await prisma.systemConfig.upsert({
      where: { key: 'queue_paused' },
      update: { value: 'true' },
      create: { key: 'queue_paused', value: 'true' }
    });

    return NextResponse.json({
      success: true,
      message: 'Processamento da fila pausado'
    });
  } catch (error) {
    console.error('[API] Erro ao pausar fila:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao pausar fila' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/queue/pause
 * Verifica se a fila está pausada
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      paused: queuePaused
    });
  } catch (error) {
    console.error('[API] Erro ao verificar status da fila:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao verificar status da fila' },
      { status: 500 }
    );
  }
} 