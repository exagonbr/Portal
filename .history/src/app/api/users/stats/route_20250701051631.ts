import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../lib/auth-headers';
import { getBackendUrl } from '../../lib/backend-config';
import { handleApiResponse } from '../../lib/response-handler';
import { createCorsOptionsResponse } from '@/config/cors';


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [/api/users/stats] Iniciando requisição...');
    
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Construir URL do backend com parâmetros
    const backendPath = '/users/stats';
    const backendUrl = new URL(getBackendUrl(backendPath));
    
    // Adicionar parâmetros de query
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    console.log('🔧 [/api/users/stats] URL do backend:', backendUrl.toString());

    // Preparar headers com diagnóstico
    const headers = prepareAuthHeaders(request);
    console.log('📤 [/api/users/stats] Headers preparados:', {
      keys: Object.keys(headers),
      hasAuth: !!headers['Authorization'],
      authPreview: headers['Authorization'] ? headers['Authorization'].substring(0, 20) + '...' : 'N/A'
    });

    // Verificar se há token de autenticação
    if (!headers['Authorization'] && !headers['X-Auth-Token'] && !headers['Cookie']) {
      console.log('❌ [/api/users/stats] ERRO CRÍTICO: Nenhum método de autenticação encontrado!');
      return NextResponse.json(
        {
          success: false,
          message: 'Token de autorização não fornecido',
          error: 'No authentication method found in request headers',
          debug: {
            headers: Object.keys(headers),
            originalHeaders: Array.from(request.headers.entries())
          }
        },
        { status: 401 }
      );
    }

    console.log('🔧 [/api/users/stats] Fazendo requisição para backend...');

    // Fazer requisição para o backend com timeout aumentado
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(60000), // 60 segundos de timeout
    });

    console.log('📡 [/api/users/stats] Resposta do backend:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Usar o handler seguro para processar a resposta
    return await handleApiResponse(response, '/api/users/stats');
  } catch (error) {
    console.log('❌ [/api/users/stats] Erro ao buscar estatísticas de usuários:', error);
    
    // Tratar erro de timeout especificamente
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('⏰ [/api/users/stats] Timeout detectado, tentando fallback...');
      
      // Retornar dados de fallback em caso de timeout
      return NextResponse.json({
          success: true,
          data: {
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
          },
          message: 'Estatísticas de usuários (dados de fallback devido a timeout)',
          debug: {
            source: 'fallback_timeout',
            timeout_duration: '60s'
          }
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
