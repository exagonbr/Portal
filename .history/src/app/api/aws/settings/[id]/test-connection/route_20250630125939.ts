import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getInternalApiUrl } from '@/config/env';

// Funções CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params;
    const response = await fetch(getInternalApiUrl(`/api/aws/settings/${resolvedParams.id}/test-connection`), {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Portal-Frontend',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    const data = await response.json();
    const origin = request.headers.get('origin') || undefined;

    return NextResponse.json(data, { 
      status: response.status,
      headers: getCorsHeaders(origin)
    });
  } catch (error) {
    console.error('Erro ao testar conexão AWS:', error);
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