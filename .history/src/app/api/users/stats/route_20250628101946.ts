import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../lib/auth-headers';
import { getInternalApiUrl } from '@/config/env';

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

    // Verificar o content-type da resposta
    const contentType = response.headers.get('content-type');
    console.log('📋 [/api/users/stats] Content-Type da resposta:', contentType);
    console.log('📋 [/api/users/stats] Status da resposta:', response.status);

    // Se não for JSON, tentar obter o texto da resposta para debug
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ [/api/users/stats] Resposta não é JSON:', text.substring(0, 200));
      
      return NextResponse.json(
        {
          success: false,
          message: 'Backend retornou resposta inválida',
          details: 'Expected JSON but received ' + (contentType || 'unknown content type')
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
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