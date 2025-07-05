import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../../lib/auth-headers';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

import { getInternalApiUrl } from '@/config/env';


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const response = await fetch(getInternalApiUrl(`/api/tv-shows/${resolvedParams.id}/modules`), {
      method: 'GET',
      headers: prepareAuthHeaders(request),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.log('Erro ao buscar módulos do TV Show:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 