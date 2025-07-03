import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../../lib/auth-headers';

import { getInternalApiUrl } from '@/config/env';


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const response = await fetch(`getInternalApiUrl('/api/users?role_id=${params.roleId}')`, {
      method: 'GET',
      headers: prepareAuthHeaders(request),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erro ao buscar usuários por role:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        data: []
      },
      { status: 500 }
    );
  }
} 