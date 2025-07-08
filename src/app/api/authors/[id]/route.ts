import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication } from '@/lib/auth-utils';
import { getInternalApiUrl } from '@/config/env';
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors';

export const dynamic = 'force-dynamic';

// Função para lidar com requisições OPTIONS (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse();
}

// Função para lidar com requisições GET para um autor específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Obter ID do autor dos parâmetros da rota
    const { id } = await params;
    
    // Construir URL para o backend
    const backendUrl = getInternalApiUrl(`/authors/${id}`);
    
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
    console.error(`Erro ao buscar autor ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para lidar com requisições PUT para atualizar um autor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request);
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter ID do autor dos parâmetros da rota
    const { id } = await params;
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Fazer requisição para o backend
    const backendUrl = getInternalApiUrl(`/authors/${id}`);
    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
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
    console.error(`Erro ao atualizar autor ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para lidar com requisições DELETE para remover um autor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request);
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter ID do autor dos parâmetros da rota
    const { id } = await params;
    
    // Fazer requisição para o backend
    const backendUrl = getInternalApiUrl(`/authors/${id}`);
    const backendResponse = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      }
    });

    // Se a resposta for 204 No Content, retornar sucesso sem corpo
    if (backendResponse.status === 204) {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Obter dados da resposta
    const data = await backendResponse.json();
    
    // Retornar resposta com headers CORS
    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error(`Erro ao excluir autor ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 