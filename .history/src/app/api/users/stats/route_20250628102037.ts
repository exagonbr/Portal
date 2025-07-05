import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../lib/auth-headers';
import { getInternalApiUrl } from '@/config/env';
import { handleApiResponse } from '../../lib/response-handler';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Construir URL do backend com parâmetros
    const backendUrl = new URL('/users/stats', getInternalApiUrl());
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    console.log('🔧 [/api/users/stats] Fazendo requisição para:', backendUrl.toString());

    // Fazer requisição para o backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: prepareAuthHeaders(request),
    });

    // Usar o handler seguro para processar a resposta
    return await handleApiResponse(response, '/api/users/stats');
  } catch (error) {
    console.error('❌ [/api/users/stats] Erro ao buscar estatísticas de usuários:', error);
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