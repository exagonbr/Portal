import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../lib/auth-headers';
import { createCorsOptionsResponse } from '@/config/cors';

const BACKEND_URL = 'https://portal.sabercon.com.br/api';


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Construir URL do backend com parâmetros - redirecionar para collections/manage
    const backendUrl = new URL('/collections/manage', BACKEND_URL);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    // Fazer requisição para o backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: prepareAuthHeaders(request),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.log('Erro ao buscar coleções para gerenciamento:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/collections/manage`, {
      method: 'POST',
      headers: prepareAuthHeaders(request),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.log('Erro ao criar coleção:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
