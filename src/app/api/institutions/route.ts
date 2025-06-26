import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../lib/auth-headers';

import { getInternalApiUrl } from '@/config/env';



export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    console.log('🔗 BACKEND_URL:', BACKEND_URL);
    
    // Preparar headers de autenticação
    const headers = prepareAuthHeaders(request);
    
    // Construir URL do backend com parâmetros
    // Se não houver token de autenticação, usar rota pública
    const hasAuthToken = headers.Authorization && headers.Authorization !== 'Bearer ';
    const routePath = hasAuthToken ? '/institutions' : '/institutions-public';
    const backendUrl = new URL(routePath, BACKEND_URL);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    console.log('🔗 Proxying to:', backendUrl.toString());
    console.log('📋 Headers:', headers);
    console.log('🔐 Using route:', hasAuthToken ? 'AUTHENTICATED' : 'PUBLIC');

    // Fazer requisição para o backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
    });

    console.log('📡 Backend response status:', response.status);
    console.log('📡 Backend response headers:', response.headers);
    
    // Se falhar, retornar erro
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', errorText);
      return NextResponse.json(
        { success: false, message: `Erro no backend: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ Resposta não é JSON:', textResponse);
      return NextResponse.json(
        { success: false, message: 'Resposta do backend não é JSON válido' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    console.log('📄 Backend response data:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Erro ao buscar instituições:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor ao buscar instituições' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`getInternalApiUrl('/api/institutions')`, {
      method: 'POST',
      headers: prepareAuthHeaders(request),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erro ao criar instituição:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 