import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication } from '@/lib/auth-utils';
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors';

/**
 * Proxy para API de units do backend - operações por ID
 */

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Construir URL para o backend
    const backendUrl = 'http://localhost:3001';
    const url = `${backendUrl}/api/units/${id}`;

    console.log(`🔄 Proxy para buscar unit: ${url}`);

    // Obter autenticação usando a função apropriada para o servidor
    const session = await getAuthentication(request);
    if (!session) {
      console.error('Token de autorização não fornecido');
      return NextResponse.json(
        { success: false, message: 'Token de autorização não fornecido' },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Obter o token do header da requisição
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    // Fazer requisição para o backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''
      },
    });

    // Obter dados da resposta
    const data = await response.json();

    // Retornar resposta para o cliente
    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error: any) {
    console.error('Erro ao buscar unidade:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao buscar unidade',
        error: error.message
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Construir URL para o backend
    const backendUrl = 'http://localhost:3001';
    const url = `${backendUrl}/api/units/${id}`;

    console.log(`🔄 Proxy para atualizar unit: ${url}`);

    const body = await request.json();

    // Obter autenticação usando a função apropriada para o servidor
    const session = await getAuthentication(request);
    if (!session) {
      console.error('Token de autorização não fornecido');
      return NextResponse.json(
        { success: false, message: 'Token de autorização não fornecido' },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Obter o token do header da requisição
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    // Fazer requisição para o backend
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''
      },
      body: JSON.stringify(body),
    });

    // Obter dados da resposta
    const data = await response.json();

    // Retornar resposta para o cliente
    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error: any) {
    console.error('Erro ao atualizar unidade:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao atualizar unidade',
        error: error.message
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Construir URL para o backend
    const backendUrl = 'http://localhost:3001';
    const url = `${backendUrl}/api/units/${id}`;

    console.log(`🔄 Proxy para excluir unit: ${url}`);

    // Obter autenticação usando a função apropriada para o servidor
    const session = await getAuthentication(request);
    if (!session) {
      console.error('Token de autorização não fornecido');
      return NextResponse.json(
        { success: false, message: 'Token de autorização não fornecido' },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Obter o token do header da requisição
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    // Fazer requisição para o backend
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''
      },
    });

    // Obter dados da resposta
    const data = await response.json();

    // Retornar resposta para o cliente
    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error: any) {
    console.error('Erro ao excluir unidade:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao excluir unidade',
        error: error.message
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 