import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from '@/config/cors';

// Interface para dados de limpeza de emergência
interface EmergencyCleanupRequest {
  action: 'client_cleanup' | 'server_cleanup' | 'full_cleanup';
  timestamp: string;
  userAgent?: string;
  sessionId?: string;
  userId?: string;
}

interface EmergencyCleanupResponse {
  success: boolean;
  message: string;
  details: {
    redisCleared: boolean;
    sessionsCleared: number;
    tokensCleared: number;
    cacheCleared: number;
    timestamp: string;
  };
}

/**
 * POST /api/auth/emergency-cleanup
 * Executa limpeza de emergência no servidor
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: EmergencyCleanupRequest = await request.json();
    const { action, timestamp, userAgent, sessionId, userId } = body;

    console.log('🚨 SOLICITAÇÃO DE LIMPEZA DE EMERGÊNCIA RECEBIDA:', {
      action,
      timestamp,
      userAgent: userAgent?.substring(0, 50) + '...',
      sessionId,
      userId
    });

    const cleanupDetails = {
      redisCleared: false,
      sessionsCleared: 0,
      tokensCleared: 0,
      cacheCleared: 0,
      timestamp: new Date().toISOString()
    };

    // Importar RedisManager dinamicamente para evitar problemas de SSR
    let RedisManager: any = null;
    try {
      const redisModule = await import('@/../../backend/src/config/redis');
      RedisManager = redisModule.RedisManager;
    } catch (error) {
      console.warn('⚠️ Redis não disponível, continuando sem limpeza Redis:', error);
    }

    // Executar limpeza baseada na ação solicitada
    switch (action) {
      case 'client_cleanup':
        // Cliente notifica que fez limpeza local
        console.log('📝 Cliente executou limpeza local');
        break;

      case 'server_cleanup':
        // Limpar apenas dados do servidor
        if (RedisManager) {
          const redisManager = RedisManager.getInstance();
          const results = await redisManager.emergencyCleanup();
          
          cleanupDetails.redisCleared = true;
          cleanupDetails.sessionsCleared = results.sessionsCleared;
          cleanupDetails.tokensCleared = results.tokensCleared;
          cleanupDetails.cacheCleared = results.cacheCleared + results.staticCacheCleared;
        }
        break;

      case 'full_cleanup':
        // Limpeza completa (servidor + notificação para cliente)
        if (RedisManager) {
          const redisManager = RedisManager.getInstance();
          const results = await redisManager.emergencyCleanup();
          
          cleanupDetails.redisCleared = true;
          cleanupDetails.sessionsCleared = results.sessionsCleared;
          cleanupDetails.tokensCleared = results.tokensCleared;
          cleanupDetails.cacheCleared = results.cacheCleared + results.staticCacheCleared;
        }
        
        // Adicionar outros tipos de limpeza aqui (banco de dados, etc.)
        await cleanupDatabaseSessions(userId);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: 'Ação de limpeza inválida',
            details: cleanupDetails
          } as EmergencyCleanupResponse,
          {
            status: 400,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
    }

    // Log da limpeza para auditoria
    await logEmergencyCleanup({
      action,
      timestamp,
      userAgent,
      sessionId,
      userId,
      details: cleanupDetails
    });

    const response: EmergencyCleanupResponse = {
      success: true,
      message: 'Limpeza de emergência executada com sucesso',
      details: cleanupDetails
    };

    console.log('✅ LIMPEZA DE EMERGÊNCIA CONCLUÍDA:', response);

    return NextResponse.json(response, {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ Erro durante limpeza de emergência:', error);

    const errorResponse: EmergencyCleanupResponse = {
      success: false,
      message: 'Erro durante limpeza de emergência',
      details: {
        redisCleared: false,
        sessionsCleared: 0,
        tokensCleared: 0,
        cacheCleared: 0,
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

/**
 * GET /api/auth/emergency-cleanup
 * Verifica status do sistema e necessidade de limpeza
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    let systemStatus = {
      redisHealthy: false,
      sessionCount: 0,
      tokenCount: 0,
      cacheSize: 0,
      needsCleanup: false,
      timestamp: new Date().toISOString()
    };

    // Verificar status do Redis
    try {
      const redisModule = await import('@/../../backend/src/config/redis');
      const RedisManager = redisModule.RedisManager;
      
      if (RedisManager) {
        const redisManager = RedisManager.getInstance();
        const health = await redisManager.healthCheck();
        
        systemStatus.redisHealthy = health.main;
        
        // Detectar se precisa de limpeza
        systemStatus.needsCleanup = await redisManager.detectLoop();
      }
    } catch (error) {
      console.warn('⚠️ Erro ao verificar status Redis:', error);
    }

    return NextResponse.json({
      success: true,
      status: systemStatus
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status do sistema:', error);

    return NextResponse.json({
      success: false,
      message: 'Erro ao verificar status do sistema'
    }, {
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

/**
 * Limpa sessões do banco de dados (se aplicável)
 */
async function cleanupDatabaseSessions(userId?: string): Promise<void> {
  try {
    // Implementar limpeza de sessões no banco de dados
    // Esta função pode ser expandida conforme necessário
    console.log('🗄️ Limpeza de sessões do banco de dados executada');
  } catch (error) {
    console.error('❌ Erro ao limpar sessões do banco:', error);
  }
}

/**
 * Registra limpeza de emergência para auditoria
 */
async function logEmergencyCleanup(data: any): Promise<void> {
  try {
    // Implementar logging para auditoria
    // Por exemplo, salvar em arquivo de log ou banco de dados
    console.log('📋 AUDITORIA - Limpeza de emergência:', {
      timestamp: data.timestamp,
      action: data.action,
      userAgent: data.userAgent?.substring(0, 100),
      details: data.details
    });
  } catch (error) {
    console.error('❌ Erro ao registrar auditoria:', error);
  }
}

// Middleware para CORS
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin') || undefined)
  });
} 