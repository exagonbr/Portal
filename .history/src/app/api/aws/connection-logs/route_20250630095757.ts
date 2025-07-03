export const dynamic = 'force-dynamic';
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

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const response = await fetch(`getInternalApiUrl('/api/aws/connection-logs?${queryString}')`, {
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
    console.error('Erro ao buscar logs de conexão AWS:', error);
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