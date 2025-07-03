import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../../lib/auth-headers';

import { getInternalApiUrl } from '@/config/env';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`getInternalApiUrl('/api/tv-shows/${params.id}/modules')`, {
      method: 'GET',
      headers: prepareAuthHeaders(request),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erro ao buscar módulos do TV Show:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 