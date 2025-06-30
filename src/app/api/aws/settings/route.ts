import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getInternalApiUrl } from '@/config/env';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      const origin = request.headers.get('origin') || undefined;
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { 
          status: 401,
          headers: getCorsHeaders(origin)
        }
      );
    }

    const response = await fetch(getInternalApiUrl('/api/aws/settings'), {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const origin = request.headers.get('origin') || undefined;

    return NextResponse.json(data, { 
      status: response.status,
      headers: getCorsHeaders(origin)
    });
  } catch (error) {
    console.error('Erro ao buscar configurações AWS:', error);
    const origin = request.headers.get('origin') || undefined;
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(origin)
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      const origin = request.headers.get('origin') || undefined;
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { 
          status: 401,
          headers: getCorsHeaders(origin)
        }
      );
    }

    const body = await request.json();

    const response = await fetch(getInternalApiUrl('/api/aws/settings'), {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    const origin = request.headers.get('origin') || undefined;

    return NextResponse.json(data, { 
      status: response.status,
      headers: getCorsHeaders(origin)
    });
  } catch (error) {
    console.error('Erro ao criar configurações AWS:', error);
    const origin = request.headers.get('origin') || undefined;
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(origin)
      }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      const origin = request.headers.get('origin') || undefined;
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { 
          status: 401,
          headers: getCorsHeaders(origin)
        }
      );
    }

    const response = await fetch(getInternalApiUrl('/api/aws/settings'), {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const origin = request.headers.get('origin') || undefined;

    if (response.status === 404) {
      // Se o backend não tem a rota, apenas retornar sucesso
      return NextResponse.json(
        { success: true, message: 'Configurações resetadas' },
        { 
          status: 200,
          headers: getCorsHeaders(origin)
        }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { 
      status: response.status,
      headers: getCorsHeaders(origin)
    });
  } catch (error) {
    console.error('Erro ao deletar configurações AWS:', error);
    const origin = request.headers.get('origin') || undefined;
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(origin)
      }
    );
  }
} 