import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../lib/auth-headers';
import { getInternalApiUrl } from '@/config/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Obter headers de autenticação de forma assíncrona
    const headers = await prepareAuthHeaders(request);

    const response = await fetch(`${getInternalApiUrl()}/api/institutions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 