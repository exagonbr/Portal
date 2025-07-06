import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication } from '@/lib/auth-utils';
import { getInternalApiUrl } from '@/config/env';
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors';

export const dynamic = 'force-dynamic';

// Função para lidar com requisições OPTIONS (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse();
}

// Função para lidar com requisições PATCH para alternar o status de um autor
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const authResult = await getAuthentication(request);
    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter ID do autor dos parâmetros da rota
    const { id } = params;
    
    // Fazer requisição para o backend
    const backendUrl = getInternalApiUrl(`/authors/${id}/status`);
    const backendResponse = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json'
      }
    });

    // Obter dados da resposta
    const data = await backendResponse.json();
    
    // Retornar resposta com headers CORS
    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error(`Erro ao alternar status do autor ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 