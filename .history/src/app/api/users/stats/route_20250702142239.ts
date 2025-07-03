import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [/api/users/stats] Iniciando requisição (ROTA PÚBLICA)...');
    
    // Retornar dados de fallback diretamente (rota pública)
    const fallbackData = {
      total_users: 18742,
      active_users: 15234,
      inactive_users: 3508,
      users_by_role: {
        'STUDENT': 14890,
        'TEACHER': 2456,
        'PARENT': 1087,
        'COORDINATOR': 234,
        'ADMIN': 67,
        'SYSTEM_ADMIN': 8
      },
      users_by_institution: {
        'Rede Municipal de Educação': 8934,
        'Instituto Federal Tecnológico': 4567,
        'Universidade Estadual': 3241,
        'Colégio Particular Alpha': 2000
      },
      recent_registrations: 287
    };

    console.log('✅ [/api/users/stats] Retornando dados de fallback (rota pública)');

    return NextResponse.json({
      success: true,
      data: fallbackData,
      message: 'Estatísticas de usuários (rota pública - dados de fallback)'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.log('❌ [/api/users/stats] Erro ao buscar estatísticas:', error);
    
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
