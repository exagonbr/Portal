import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../lib/auth-headers';

import { getInternalApiUrl } from '@/config/env';


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    console.log('🔗 BACKEND_URL:', getInternalApiUrl());
    
    // Preparar headers de autenticação
    const headers = prepareAuthHeaders(request);
    
    // Verificar se há um token válido de autenticação
    const authHeader = headers.Authorization;
    const hasValidAuthToken = authHeader && 
                              authHeader.startsWith('Bearer ') && 
                              authHeader.length > 'Bearer '.length &&
                              authHeader !== 'Bearer ';
    
    // Construir URL do backend com parâmetros
    // Se não houver token de autenticação válido, usar rota pública
    const routePath = hasValidAuthToken ? '/api/institutions' : '/api/institutions-public';
    const backendUrl = new URL(routePath, getInternalApiUrl());
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    console.log('🔗 Proxying to:', backendUrl.toString());
    console.log('📋 Auth Header:', authHeader ? 'Present' : 'Missing');
    console.log('🔐 Using route:', hasValidAuthToken ? 'AUTHENTICATED (/api/institutions)' : 'PUBLIC (/api/institutions-public)');

    // Preparar headers para a requisição
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Só incluir Authorization header se estivermos usando a rota autenticada
    if (hasValidAuthToken && authHeader) {
      requestHeaders['Authorization'] = authHeader;
    }

    // Fazer requisição para o backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: requestHeaders,
    });

    console.log('📡 Backend response status:', response.status);
    
    // Se falhar, retornar erro
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', errorText);
      
      // Se for erro 401 na rota autenticada, tentar rota pública como fallback
      if (response.status === 401 && hasValidAuthToken) {
        console.log('🔄 Tentando fallback para rota pública...');
        const publicUrl = new URL('/api/institutions-public', getInternalApiUrl());
        searchParams.forEach((value, key) => {
          publicUrl.searchParams.append(key, value);
        });
        
        const fallbackResponse = await fetch(publicUrl.toString(), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('✅ Fallback para rota pública funcionou');
          return NextResponse.json(fallbackData, { status: fallbackResponse.status });
        }
      }
      
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
    console.log('📄 Backend response data keys:', Object.keys(data));

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

    const response = await fetch(`${getInternalApiUrl()}/api/institutions`, {
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