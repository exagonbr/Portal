import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../lib/auth-headers';
import { getBackendUrl } from '../../lib/backend-config';
import { handleApiResponse } from '../../lib/response-handler';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Construir URL do backend com parâmetros
    const backendPath = '/users/stats';
    const backendUrl = new URL(getBackendUrl(backendPath));
    
    // Adicionar parâmetros de query
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    console.log('🔧 [/api/users/stats] Fazendo requisição para:', backendUrl.toString());

    // Fazer requisição para o backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: prepareAuthHeaders(request),
      signal: AbortSignal.timeout(30000), // 30 segundos de timeout
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