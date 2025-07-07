import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/config/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'https://portal.sabercon.com.br/api';
const TIMEOUT = 10000; // 10 segundos

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(`${BACKEND_URL}/groups/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Se não for JSON, retornar erro
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Resposta inválida do servidor' },
        { status: 502, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: getCorsHeaders(request.headers.get('origin'))
    });
  } catch (error: any) {
    console.log('Erro ao buscar estatísticas dos grupos:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Timeout ao buscar estatísticas dos grupos' },
        { status: 504, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}
