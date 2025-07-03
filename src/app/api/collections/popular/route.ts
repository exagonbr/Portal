import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../lib/auth-headers';

import { getInternalApiUrl } from '@/config/env';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Construir URL do backend com parâmetros
    const backendUrl = new URL('/collections/popular', getInternalApiUrl());
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
    console.error('Erro ao buscar coleções populares:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}