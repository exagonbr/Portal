import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../lib/auth-headers';
import { CORS_HEADERS } from '@/config/cors';
import { getInternalApiUrl } from '@/config/env';

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Construir URL do backend com parâmetros
    const backendUrl = new URL(getInternalApiUrl('/api/tv-shows'));
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    // Fazer requisição para o backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: prepareAuthHeaders(request),
    });

    const data = await response.json();

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar TV Shows:', error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(getInternalApiUrl('/api/tv-shows'), {
      method: 'POST',
      headers: prepareAuthHeaders(request),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.error('Erro ao criar TV Show:', error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
} 