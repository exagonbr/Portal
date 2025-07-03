import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [/api/aws/connection-logs/stats] Iniciando requisição (ROTA PÚBLICA)...');
    
    // Retornar dados de fallback diretamente (rota pública)
    const fallbackData = {
      total_connections: 45623,
      successful_connections: 42891,
      failed_connections: 2732,
      success_rate: 94.02,
      connections_by_region: {
        'us-east-1': 15234,
        'us-west-2': 12456,
        'eu-west-1': 8934,
        'ap-southeast-1': 5678,
        'sa-east-1': 3321
      },
      connections_by_service: {
        'S3': 18923,
        'EC2': 12456,
        'RDS': 8934,
        'Lambda': 3456,
        'CloudFront': 1854
      },
      recent_connections: 1234,
      average_response_time: 245.67
    };

    console.log('✅ [/api/aws/connection-logs/stats] Retornando dados de fallback (rota pública)');

    return NextResponse.json({
      success: true,
      data: fallbackData,
      message: 'Estatísticas de conexões AWS (rota pública - dados de fallback)'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.log('❌ [/api/aws/connection-logs/stats] Erro ao buscar estatísticas:', error);
    
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
