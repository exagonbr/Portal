import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../lib/auth-headers';
import { getBackendUrl } from '../../lib/backend-config';
import { handleApiResponse } from '../../lib/response-handler';

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
      console.error('❌ [/api/users/stats] ERRO CRÍTICO: Nenhum método de autenticação encontrado!');
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

    // Fazer requisição para o backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000), // 30 segundos de timeout
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
    console.error('❌ [/api/users/stats] Erro ao buscar estatísticas de usuários:', error);
    
    // Tratar erro de timeout especificamente
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Timeout ao conectar com o backend',
          error: 'Request timeout after 30 seconds'
        },
        { status: 504 } // Gateway Timeout
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