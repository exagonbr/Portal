import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

const BACKEND_URL = process.env.BACKEND_URL || 'https://portal.sabercon.com.br/api';


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/groups/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      }
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos grupos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
