import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/config/redis';

// Funções CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID é obrigatório' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    console.log(`🔄 Redis: Iniciando invalidação da sessão: ${sessionId}`);

    // Invalidate session in Redis with multiple patterns
    try {
      const redis = getRedisClient();
      
      // Padrões de chaves que podem existir para a sessão
      const sessionPatterns = [
        `session:${sessionId}`,
        `sess:${sessionId}`,
        `user_session:${sessionId}`,
        `auth_session:${sessionId}`,
        sessionId // Caso seja apenas o ID
      ];

      let deletedKeys = 0;
      
      for (const pattern of sessionPatterns) {
        try {
          const result = await redis.del(pattern);
          if (result > 0) {
            deletedKeys += result;
            console.log(`✅ Redis: Chave removida: ${pattern}`);
          }
        } catch (keyError) {
          console.warn(`⚠️ Redis: Erro ao remover chave ${pattern}:`, keyError);
        }
      }

      // Também tentar buscar por padrões usando SCAN
      try {
        const keys = await redis.keys(`*${sessionId}*`);
        if (keys.length > 0) {
          const additionalDeleted = await redis.del(...keys);
          deletedKeys += additionalDeleted;
          console.log(`✅ Redis: ${additionalDeleted} chaves adicionais removidas por padrão`);
        }
      } catch (scanError) {
        console.warn('⚠️ Redis: Erro ao buscar chaves por padrão:', scanError);
      }

      console.log(`✅ Redis: Total de ${deletedKeys} chaves removidas para sessão ${sessionId}`);
      
    } catch (redisError) {
      console.error('❌ Redis: Erro ao invalidar sessão:', redisError);
      // Continue even if Redis fails - don't block logout
      return NextResponse.json({
        success: true,
        message: 'Sessão invalidada (com avisos no Redis)',
        warning: 'Erro no Redis, mas logout continuou'
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sessão invalidada com sucesso no Redis' 
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ API: Erro crítico ao invalidar sessão:', error);
    return NextResponse.json({ 
        success: true, // Retorna sucesso para não bloquear logout
        message: 'Sessão invalidada (com erros recuperáveis, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })',
        error: 'Erro interno, mas logout foi processado'
      },
      { status: 200 } // 200 para não bloquear o logout
    );
  }
}
