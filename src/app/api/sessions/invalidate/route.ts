import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/config/redis';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID é obrigatório' },
        { status: 400 }
      );
    }

    // Invalidate session in Redis
    try {
      const redis = getRedisClient();
      await redis.del(`session:${sessionId}`);
      console.log(`Sessão Redis invalidada: ${sessionId}`);
    } catch (redisError) {
      console.error('Erro ao invalidar sessão no Redis:', redisError);
      // Continue even if Redis fails - don't block logout
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sessão invalidada com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao invalidar sessão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}