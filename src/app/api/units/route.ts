import { NextRequest, NextResponse } from 'next/server'
import { getAuthentication } from '@/lib/auth-utils'
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors'

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

/**
 * Proxy para API de units do backend
 */
export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const institutionId = searchParams.get('institutionId') || '';

    // Construir URL para o backend
    const backendUrl = 'http://localhost:3001';
    let url = `${backendUrl}/api/units?page=${page}&limit=${limit}`;
    
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (institutionId) url += `&institutionId=${institutionId}`;

    console.log(`🔄 Proxy para units: ${url}`);

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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''
      },
      cache: 'no-store'
    });

    // Obter dados da resposta
    const data = await response.json();

    // Retornar resposta para o cliente
    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error: any) {
    console.error('Erro ao buscar unidades:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao buscar unidades',
        error: error.message
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// POST - Criar unidade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Construir URL para o backend
    const backendUrl = 'http://localhost:3001';
    const url = `${backendUrl}/api/units`;

    console.log(`🔄 Proxy para criar unit: ${url}`);

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
      method: 'POST',
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
    console.error('Erro ao criar unidade:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao criar unidade',
        error: error.message
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 
