import { NextRequest, NextResponse } from 'next/server';
import { CORS_HEADERS } from '@/config/cors';

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [TV-SHOWS-API] Retornando dados mock temporários para evitar loop');
    
    // Dados mock temporários para evitar o loop infinito
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
            created_at: new Date().toISOString()
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
            created_at: new Date().toISOString()
          }
        ],
        page: 1,
        totalPages: 1,
        total: 2
      },
      message: "Dados mock - API temporariamente em modo de recuperação"
    };

    return new NextResponse(JSON.stringify(mockData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.error('❌ [TV-SHOWS-API] Erro:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Retornar resposta mock para POST também
    return new NextResponse(JSON.stringify({
      success: true,
      message: "Funcionalidade temporariamente desabilitada - modo de recuperação",
      data: body
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.log('Erro ao criar TV Show:', error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
} 
