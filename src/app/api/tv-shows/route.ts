import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../lib/auth-headers';
import { CORS_HEADERS } from '@/config/cors';
import { getInternalApiUrl } from '@/config/env';

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [TV-SHOWS-API] Tentando buscar dados do backend...');
    
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Verificar se há um parâmetro para desativar mock
    const noMock = searchParams.get('no_mock') === 'true';
    if (noMock) {
      console.log('⚠️ [TV-SHOWS-API] Parâmetro no_mock=true detectado - forçando conexão com backend real');
      searchParams.delete('no_mock'); // Remover parâmetro antes de enviar para o backend
    }
    
    // Construir URL do backend com parâmetros
    const backendUrl = new URL(getInternalApiUrl('/tv-shows'));
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    console.log('🔗 [TV-SHOWS-API] URL do backend:', backendUrl.toString());

    // Preparar headers de autenticação
    const headers = prepareAuthHeaders(request);

    // Fazer requisição para o backend com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('✅ [TV-SHOWS-API] Resposta recebida:', response.status);

    if (!response.ok) {
      console.error('❌ [TV-SHOWS-API] Erro na resposta do backend:', response.status);
      
      // Se for erro de autenticação e não estiver forçando conexão real, retornar dados mock
      if ((response.status === 401 || response.status === 403) && !noMock) {
        console.log('🔄 [TV-SHOWS-API] Erro de autenticação, retornando dados mock como fallback');
        return getMockDataResponse();
      }
      
      throw new Error(`Backend retornou status ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 [TV-SHOWS-API] Dados recebidos do backend:', { 
      success: data.success, 
      itemCount: data.data?.tvShows?.length || data.data?.items?.length || 0 
    });

    return NextResponse.json(data, {
      status: 200,
      headers: CORS_HEADERS,
    });

  } catch (error) {
    console.error('❌ [TV-SHOWS-API] Erro ao buscar TV Shows:', error);
    
    // Verificar se a URL tem parâmetro para desativar mock
    const url = new URL(request.url);
    const noMock = url.searchParams.get('no_mock') === 'true';
    
    // Em caso de erro e não estiver forçando conexão real, retornar dados mock
    if (!noMock) {
      console.log('🔄 [TV-SHOWS-API] Retornando dados mock como fallback devido ao erro');
      return getMockDataResponse();
    }
    
    // Se estiver forçando conexão real, retornar o erro
    return NextResponse.json({
      success: false,
      message: "Erro ao conectar com o backend. Tentativa de conexão real forçada falhou.",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

// Função para retornar dados mock
function getMockDataResponse() {
  const mockData = {
    success: true,
    data: {
      tvShows: [
        {
          id: 1,
          name: "Coleção de Exemplo 1",
          overview: "Esta é uma coleção de exemplo para demonstração do sistema.",
          producer: "Sabercon",
          poster_path: "/placeholder-poster.jpg",
          backdrop_path: "/placeholder-backdrop.jpg",
          total_load: "5h 30m",
          popularity: 8.5,
          vote_average: 4.2,
          vote_count: 150,
          video_count: 25,
          created_at: new Date().toISOString(),
          date_created: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          first_air_date: new Date().toISOString(),
          contract_term_end: new Date().toISOString(),
          deleted: false
        },
        {
          id: 2,
          name: "Coleção de Exemplo 2", 
          overview: "Outra coleção de exemplo com conteúdo educacional.",
          producer: "Sabercon",
          poster_path: "/placeholder-poster.jpg",
          backdrop_path: "/placeholder-backdrop.jpg",
          total_load: "3h 45m",
          popularity: 7.8,
          vote_average: 4.0,
          vote_count: 89,
          video_count: 18,
          created_at: new Date().toISOString(),
          date_created: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          first_air_date: new Date().toISOString(),
          contract_term_end: new Date().toISOString(),
          deleted: false
        }
      ],
      page: 1,
      totalPages: 1,
      total: 2
    },
    message: "Dados mock - Fallback devido a erro de autenticação ou conexão"
  };

  return new NextResponse(JSON.stringify(mockData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Tentar criar no backend real
    const backendUrl = getInternalApiUrl('/tv-shows');
    const headers = prepareAuthHeaders(request);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('❌ [TV-SHOWS-API] Erro ao criar TV Show no backend:', response.status);
      throw new Error(`Backend retornou status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 201,
      headers: CORS_HEADERS,
    });

  } catch (error) {
    console.error('❌ [TV-SHOWS-API] Erro ao criar TV Show:', error);
    
    // Retornar resposta mock em caso de erro
    return new NextResponse(JSON.stringify({
      success: false,
      message: "Erro ao criar TV Show - funcionalidade temporariamente indisponível",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  }
} 
