import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication } from '@/lib/auth-utils';
import { getInternalApiUrl } from '@/config/env';
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors';

export const dynamic = 'force-dynamic';

// Rota OPTIONS para CORS preflight
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse(request.headers.get('origin') || undefined);
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token de autenticação não encontrado'
        },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Obter token para passar para a API interna
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth_token')?.value || 
                  '';

    // Fazer requisição para API interna
    const response = await fetch(`${getInternalApiUrl('/certificates/stats')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.log('Erro ao obter estatísticas de certificados:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao obter estatísticas de certificados',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 