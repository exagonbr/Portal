import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getAuthentication } from '@/lib/auth-utils';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_API_URL}/api/answers${queryString ? `?${queryString}` : ''}`;

    console.log('🔄 [API-ANSWERS] Redirecionando para backend:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user?.id || 'anonymous'}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ [API-ANSWERS] Erro no backend:', response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false, 
          message: `Erro no backend: ${response.status} ${response.statusText}` 
        },
        { 
          status: response.status,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const data = await response.json();
    
    console.log('✅ [API-ANSWERS] Dados obtidos do backend:', {
      items: Array.isArray(data?.items) ? data.items.length : 'N/A',
      total: data?.total || 'N/A'
    });

    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ [API-ANSWERS] Erro interno:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const body = await request.json();
    const url = `${BACKEND_API_URL}/api/answers`;

    console.log('🔄 [API-ANSWERS] Criando answer no backend:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user?.id || 'anonymous'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('❌ [API-ANSWERS] Erro ao criar answer:', response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false, 
          message: `Erro no backend: ${response.status} ${response.statusText}` 
        },
        { 
          status: response.status,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const data = await response.json();
    
    console.log('✅ [API-ANSWERS] Answer criada no backend');

    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ [API-ANSWERS] Erro interno:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse(request.headers.get('origin') || undefined);
} 