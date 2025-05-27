import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '../../../services/sessionService';
import { testRedisConnection } from '../../../config/redis';

// GET /api/sessions - Lista todas as sessões ativas (admin)
export async function GET(request: NextRequest) {
  try {
    // Verifica conexão com Redis
    const isRedisConnected = await testRedisConnection();
    if (!isRedisConnected) {
      return NextResponse.json(
        { error: 'Serviço de sessões indisponível' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Lista sessões de um usuário específico
      const sessions = await sessionService.getUserSessions(userId);
      return NextResponse.json({ sessions });
    } else {
      // Lista estatísticas gerais
      const activeUsersCount = (await sessionService.getActiveUsers()).length;
      const activeSessionsCount = await sessionService.getActiveSessionsCount();
      
      return NextResponse.json({
        activeUsers: activeUsersCount,
        activeSessions: activeSessionsCount,
      });
    }
  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions - Remove sessões
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (action === 'cleanup') {
      // Limpa sessões expiradas
      const cleanedCount = await sessionService.cleanupExpiredSessions();
      return NextResponse.json({ 
        message: `${cleanedCount} sessões expiradas foram removidas`,
        cleanedCount 
      });
    }

    if (sessionId) {
      // Remove uma sessão específica
      const success = await sessionService.destroySession(sessionId);
      if (success) {
        return NextResponse.json({ message: 'Sessão removida com sucesso' });
      } else {
        return NextResponse.json(
          { error: 'Sessão não encontrada' },
          { status: 404 }
        );
      }
    }

    if (userId) {
      // Remove todas as sessões de um usuário
      const removedCount = await sessionService.destroyAllUserSessions(userId);
      return NextResponse.json({ 
        message: `${removedCount} sessões removidas para o usuário`,
        removedCount 
      });
    }

    return NextResponse.json(
      { error: 'Parâmetros inválidos' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao remover sessões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}