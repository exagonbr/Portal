import { NextRequest, NextResponse } from 'next/server';
import { getInternalApiUrl } from '@/config/env';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth-middleware';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    console.log('📊 [/api/aws/connection-logs/stats] Buscando estatísticas AWS...');
    
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const apiUrl = queryString
      ? `${getInternalApiUrl('/aws/connection-logs/stats')}?${queryString}`
      : getInternalApiUrl('/aws/connection-logs/stats');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('⚠️ [/api/aws/connection-logs/stats] Backend indisponível, usando dados mock');
      
      // Se o backend não estiver disponível, retornar dados mock
      const mockStats = {
        total_connections: 1247,
        successful_connections: 1198,
        failed_connections: 49,
        success_rate: 96.07,
        average_response_time: 245.8,
        last_connection: new Date().toISOString(),
        last_successful_connection: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        services_used: ['s3', 'cloudwatch', 'ec2', 'rds']
      };

      return NextResponse.json({
        success: true,
        data: mockStats,
        source: 'mock'
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.log('❌ [/api/aws/connection-logs/stats] Erro ao buscar estatísticas:', error);
    
    // Fallback com dados mock em caso de erro
    const mockStats = {
      total_connections: 1247,
      successful_connections: 1198,
      failed_connections: 49,
      success_rate: 96.07,
      average_response_time: 245.8,
      last_connection: new Date().toISOString(),
      last_successful_connection: new Date(Date.now() - 300000).toISOString(),
      services_used: ['s3', 'cloudwatch', 'ec2', 'rds']
    };

    return NextResponse.json({
      success: true,
      data: mockStats,
      source: 'mock',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}, {
  requiredRoles: ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER']
});
