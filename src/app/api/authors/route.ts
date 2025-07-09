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
    
    // Retornar resposta com headers CORS
    return NextResponse.json(data, {
      status: response.status,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('Erro ao buscar autores:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
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