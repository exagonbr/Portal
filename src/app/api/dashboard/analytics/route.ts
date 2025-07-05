import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [/api/dashboard/analytics] Iniciando requisição (ROTA PÚBLICA)...');
    
    // Retornar dados de fallback diretamente (rota pública)
    const fallbackData = {
      total_pageviews: 125789,
      unique_visitors: 8934,
      bounce_rate: 32.45,
      average_session_duration: 342.67,
      top_pages: [
        { page: '/dashboard', views: 23456, unique_visitors: 3456 },
        { page: '/courses', views: 18923, unique_visitors: 2891 },
        { page: '/profile', views: 15678, unique_visitors: 2345 },
        { page: '/assignments', views: 12456, unique_visitors: 1987 },
        { page: '/notifications', views: 9876, unique_visitors: 1654 }
      ],
      traffic_sources: {
        'Direct': 45.2,
        'Search': 28.7,
        'Social': 15.6,
        'Referral': 8.9,
        'Email': 1.6
      },
      devices: {
        'Desktop': 62.3,
        'Mobile': 31.4,
        'Tablet': 6.3
      },
      browsers: {
        'Chrome': 68.9,
        'Safari': 16.7,
        'Firefox': 8.9,
        'Edge': 4.2,
        'Others': 1.3
      }
    };

    console.log('✅ [/api/dashboard/analytics] Retornando dados de fallback (rota pública)');

    return NextResponse.json({
      success: true,
      data: fallbackData,
      message: 'Analytics do dashboard (rota pública - dados de fallback)'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.log('❌ [/api/dashboard/analytics] Erro ao buscar analytics:', error);
    
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
