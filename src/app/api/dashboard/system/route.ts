import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [/api/dashboard/system] Iniciando requisição (ROTA PÚBLICA)...');
    
    // Retornar dados de fallback diretamente (rota pública)
    const fallbackData = {
      // Estatísticas principais para a página de instituições
      institutions: { total: 3 },
      schools: { total: 8 },
      users: { total: 1250 },
      courses: { total: 45 },
      classes: { total: 32 },
      
      // Dados do sistema
      system_health: {
        status: 'healthy',
        uptime: 2547896, // em segundos
        cpu_usage: 23.5,
        memory_usage: 67.8,
        disk_usage: 45.2
      },
      database: {
        status: 'connected',
        response_time: 45.67, // em ms
        active_connections: 23,
        max_connections: 100,
        queries_per_second: 156.78
      },
      cache: {
        status: 'active',
        hit_rate: 89.5,
        memory_usage: 34.2,
        keys_count: 12456
      },
      api_performance: {
        average_response_time: 234.56, // em ms
        requests_per_minute: 456,
        error_rate: 0.8,
        success_rate: 99.2
      },
      storage: {
        total_files: 45678,
        total_size: '234.56 GB',
        uploads_today: 234,
        downloads_today: 1234
      },
      security: {
        failed_login_attempts: 12,
        blocked_ips: 3,
        active_sessions: 456,
        last_security_scan: '2024-01-15T10:30:00Z'
      },
      recent_activities: [
        { timestamp: '2024-01-15T14:30:00Z', activity: 'System backup completed', type: 'info' },
        { timestamp: '2024-01-15T13:45:00Z', activity: 'Database optimization finished', type: 'success' },
        { timestamp: '2024-01-15T12:15:00Z', activity: 'Cache cleared successfully', type: 'info' },
        { timestamp: '2024-01-15T11:30:00Z', activity: 'Security scan completed', type: 'success' },
        { timestamp: '2024-01-15T10:45:00Z', activity: 'System restart completed', type: 'warning' }
      ]
    };

    console.log('✅ [/api/dashboard/system] Retornando dados de fallback (rota pública)');

    return NextResponse.json({
      success: true,
      data: fallbackData,
      message: 'Informações do sistema (rota pública - dados de fallback)'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.log('❌ [/api/dashboard/system] Erro ao buscar informações do sistema:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 
