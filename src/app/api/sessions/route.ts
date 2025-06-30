import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '../../../services/sessionService';
import { testRedisConnection } from '../../../config/redis';

// GET /api/sessions - Lista todas as sessões ativas (admin)

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    // Verifica conexão com Redis
    const isRedisConnected = await testRedisConnection();
    if (!isRedisConnected) {
      return NextResponse.json({ error: 'Serviço de sessões indisponível' }, { 
      status: 503,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Lista sessões de um usuário específico
      const sessions = await sessionService.getUserSessions(userId);
      return NextResponse.json({ sessions }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    } else {
      // Lista estatísticas gerais
      const activeUsersCount = (await sessionService.getActiveUsers()).length;
      const activeSessionsCount = await sessionService.getActiveSessionsCount();
      
      return NextResponse.json({
        activeUsers: activeUsersCount,
        activeSessions: activeSessionsCount,
      }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }
  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
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
      }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    if (sessionId) {
      // Remove uma sessão específica
      const success = await sessionService.destroySession(sessionId);
      if (success) {
        return NextResponse.json({ message: 'Sessão removida com sucesso' }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
      } else {
        return NextResponse.json(
          { error: 'Sessão não encontrada' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
      }
    }

    if (userId) {
      // Remove todas as sessões de um usuário
      const removedCount = await sessionService.destroyAllUserSessions(userId);
      return NextResponse.json({ 
        message: `${removedCount} sessões removidas para o usuário`,
        removedCount 
      }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    return NextResponse.json({ error: 'Parâmetros inválidos' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('Erro ao remover sessões:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}