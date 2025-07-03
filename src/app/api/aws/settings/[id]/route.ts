import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getInternalApiUrl } from '@/config/env';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
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

    const params = await context.params;
    const response = await fetch(getInternalApiUrl(`/api/aws/settings/${params.id}`), {
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
    console.log('Erro ao buscar configuração AWS:', error);
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

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
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
    const params = await context.params;

    const response = await fetch(getInternalApiUrl(`/api/aws/settings/${params.id}`), {
      method: 'PUT',
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
    console.log('Erro ao atualizar configuração AWS:', error);
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

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
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

    const params = await context.params;
    const response = await fetch(getInternalApiUrl(`/api/aws/settings/${params.id}`), {
      method: 'DELETE',
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
    console.log('Erro ao deletar configuração AWS:', error);
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
