import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication } from '@/lib/auth-utils';
import { getInternalApiUrl } from '@/config/env';
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors';

export const dynamic = 'force-dynamic';

// Função para lidar com requisições OPTIONS (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse();
}

// Função para lidar com requisições GET
export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da query
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // Construir URL para o backend
    const backendUrl = getInternalApiUrl(`/authors${queryString ? `?${queryString}` : ''}`);
    console.log('Fazendo requisição para:', backendUrl);
    
    // Fazer requisição para o backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      }
    });

    // Obter dados da resposta
    const data = await response.json();
    console.log('Resposta do backend:', JSON.stringify(data));
    
    // Garantir que a resposta esteja no formato esperado
    let formattedResponse;
    
    if (Array.isArray(data)) {
      // Se for um array, converter para o formato esperado
      formattedResponse = {
        items: data,
        total: data.length,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10'),
        totalPages: Math.ceil(data.length / parseInt(searchParams.get('limit') || '10'))
      };
    } else if (data && typeof data === 'object') {
      if (data.items && Array.isArray(data.items)) {
        // Já está no formato esperado
        formattedResponse = data;
      } else if (data.data && Array.isArray(data.data)) {
        // Formato { data: [...], ... }
        formattedResponse = {
          items: data.data,
          total: data.total || data.data.length,
          page: data.page || parseInt(searchParams.get('page') || '1'),
          limit: data.limit || parseInt(searchParams.get('limit') || '10'),
          totalPages: data.totalPages || Math.ceil((data.total || data.data.length) / (data.limit || parseInt(searchParams.get('limit') || '10')))
        };
      } else {
        // Tentar encontrar um array em alguma propriedade
        let arrayFound = false;
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            formattedResponse = {
              items: data[key],
              total: data[key].length,
              page: parseInt(searchParams.get('page') || '1'),
              limit: parseInt(searchParams.get('limit') || '10'),
              totalPages: Math.ceil(data[key].length / parseInt(searchParams.get('limit') || '10'))
            };
            arrayFound = true;
            break;
          }
        }
        
        if (!arrayFound) {
          // Se não encontrar nenhum array, retornar array vazio
          formattedResponse = {
            items: [],
            total: 0,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
            totalPages: 0
          };
        }
      }
    } else {
      // Fallback para array vazio
      formattedResponse = {
        items: [],
        total: 0,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10'),
        totalPages: 0
      };
    }
    
    console.log('Resposta formatada:', JSON.stringify(formattedResponse));
    
    // Retornar resposta com headers CORS
    return NextResponse.json(formattedResponse, {
      status: response.status,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('Erro ao buscar autores:', error);
    return NextResponse.json(
      { 
        items: [], 
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

// Função para lidar com requisições POST
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request);
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Fazer requisição para o backend
    const backendUrl = getInternalApiUrl('/authors');
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    // Obter dados da resposta
    const data = await backendResponse.json();
    
    // Retornar resposta com headers CORS
    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('Erro ao criar autor:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 