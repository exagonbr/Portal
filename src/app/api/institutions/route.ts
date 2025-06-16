import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../lib/auth-headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001/api';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    console.log('🔗 BACKEND_URL:', BACKEND_URL);
    
    // Construir URL do backend com parâmetros
    const backendUrl = new URL('/institutions', BACKEND_URL);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    console.log('🔗 Proxying to:', backendUrl.toString());
    const headers = prepareAuthHeaders(request);
    console.log('📋 Headers:', headers);

    // Fazer requisição para o backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
    });

    console.log('📡 Backend response status:', response.status);
    console.log('📡 Backend response headers:', response.headers);
    
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ Resposta não é JSON:', textResponse);
      return NextResponse.json(
        { success: false, message: 'Backend retornou resposta inválida' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    console.log('📄 Backend response data:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Erro ao buscar instituições:', error);
    console.error('❌ Error details:', error.message);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/institutions`, {
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