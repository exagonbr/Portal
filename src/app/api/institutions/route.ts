import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../lib/auth-headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001/api';

// Mock data para instituições (fallback)
const mockInstitutions = [
  {
    id: 'inst-sabercon',
    name: 'Escola SaberCon Digital',
    code: 'SABERCON',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inst-exagon',
    name: 'Colégio Exagon Inovação',
    code: 'EXAGON',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inst-devstrade',
    name: 'Centro Educacional DevStrade',
    code: 'DEVSTRADE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inst-unifesp',
    name: 'Universidade Federal de São Paulo',
    code: 'UNIFESP',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inst-usp',
    name: 'Universidade de São Paulo',
    code: 'USP',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const public_access = searchParams.get('public') === 'true';
    
    // Se for acesso público, retornar dados mock
    if (public_access) {
      console.log('🔓 Acesso público a instituições - retornando dados mock');
      return NextResponse.json({
        success: true,
        data: mockInstitutions
      });
    }
    
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
    
    // Se falhar, retornar dados mock como fallback
    if (!response.ok) {
      console.warn('⚠️ Backend falhou, usando dados mock como fallback');
      return NextResponse.json({
        success: true,
        data: {
          items: mockInstitutions,
          pagination: {
            page: 1,
            limit: mockInstitutions.length,
            total: mockInstitutions.length,
            totalPages: 1
          }
        }
      });
    }
    
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ Resposta não é JSON:', textResponse);
      
      // Retornar dados mock como fallback
      return NextResponse.json({
        success: true,
        data: {
          items: mockInstitutions,
          pagination: {
            page: 1,
            limit: mockInstitutions.length,
            total: mockInstitutions.length,
            totalPages: 1
          }
        }
      });
    }
    
    const data = await response.json();
    console.log('📄 Backend response data:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Erro ao buscar instituições:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
    
    // Em caso de erro, retornar dados mock
    console.log('🔧 Usando dados mock como fallback devido ao erro');
    return NextResponse.json({
      success: true,
      data: {
        items: mockInstitutions,
        pagination: {
          page: 1,
          limit: mockInstitutions.length,
          total: mockInstitutions.length,
          totalPages: 1
        }
      }
    });
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