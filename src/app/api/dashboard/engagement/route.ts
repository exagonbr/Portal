import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [/api/dashboard/engagement] Iniciando requisição (ROTA PÚBLICA)...');
    
    // Retornar dados de fallback diretamente (rota pública)
    const fallbackData = {
      daily_active_users: 2456,
      weekly_active_users: 8934,
      monthly_active_users: 15678,
      average_session_time: 1847, // em segundos
      user_retention: {
        day_1: 78.5,
        day_7: 45.2,
        day_30: 23.8
      },
      engagement_metrics: {
        posts_created: 5678,
        comments_made: 12345,
        likes_given: 23456,
        shares_made: 3456,
        files_uploaded: 1234
      },
      activity_by_hour: [
        { hour: 0, activity: 234 },
        { hour: 1, activity: 156 },
        { hour: 2, activity: 89 },
        { hour: 3, activity: 67 },
        { hour: 4, activity: 45 },
        { hour: 5, activity: 78 },
        { hour: 6, activity: 234 },
        { hour: 7, activity: 456 },
        { hour: 8, activity: 789 },
        { hour: 9, activity: 1234 },
        { hour: 10, activity: 1456 },
        { hour: 11, activity: 1678 },
        { hour: 12, activity: 1789 },
        { hour: 13, activity: 1654 },
        { hour: 14, activity: 1567 },
        { hour: 15, activity: 1345 },
        { hour: 16, activity: 1123 },
        { hour: 17, activity: 987 },
        { hour: 18, activity: 765 },
        { hour: 19, activity: 543 },
        { hour: 20, activity: 432 },
        { hour: 21, activity: 321 },
        { hour: 22, activity: 234 },
        { hour: 23, activity: 178 }
      ],
      top_features: [
        { feature: 'Dashboard', usage: 89.5 },
        { feature: 'Courses', usage: 76.3 },
        { feature: 'Assignments', usage: 65.7 },
        { feature: 'Chat', usage: 54.2 },
        { feature: 'Calendar', usage: 43.8 }
      ]
    };

    console.log('✅ [/api/dashboard/engagement] Retornando dados de fallback (rota pública)');

    return NextResponse.json({
      success: true,
      data: fallbackData,
      message: 'Métricas de engajamento (rota pública - dados de fallback)'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.log('❌ [/api/dashboard/engagement] Erro ao buscar métricas de engajamento:', error);
    
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
