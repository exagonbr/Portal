import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Obter token de autenticação
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token de autenticação não encontrado'
        },
        { status: 401 }
      );
    }
    
    // Construir URL com parâmetros de query
    const params = new URLSearchParams();
    
    // Paginação
    params.set('page', searchParams.get('page') || '1');
    params.set('limit', searchParams.get('limit') || '10');
    
    // Filtros
    if (searchParams.get('user_id')) {
      params.set('user_id', searchParams.get('user_id')!);
    }
    if (searchParams.get('tv_show_id')) {
      params.set('tv_show_id', searchParams.get('tv_show_id')!);
    }
    if (searchParams.get('score')) {
      params.set('score', searchParams.get('score')!);
    }
    if (searchParams.get('document')) {
      params.set('document', searchParams.get('document')!);
    }
    if (searchParams.get('license_code')) {
      params.set('license_code', searchParams.get('license_code')!);
    }
    if (searchParams.get('tv_show_name')) {
      params.set('tv_show_name', searchParams.get('tv_show_name')!);
    }
    if (searchParams.get('recreate')) {
      params.set('recreate', searchParams.get('recreate')!);
    }
    if (searchParams.get('search')) {
      params.set('search', searchParams.get('search')!);
    }
    
    // Ordenação
    if (searchParams.get('sort_by')) {
      params.set('sort_by', searchParams.get('sort_by')!);
    }
    if (searchParams.get('sort_order')) {
      params.set('sort_order', searchParams.get('sort_order')!);
    }

    const response = await fetch(`${API_BASE_URL}/api/certificates?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro ao buscar certificados:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao buscar certificados',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Obter token de autenticação
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token de autenticação não encontrado'
        },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar certificado:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao criar certificado',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
