import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

const BACKEND_URL = process.env.BACKEND_URL || 'https://portal.sabercon.com.br/api';


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
    const response = await fetch(`${BACKEND_URL}/api/groups/${resolvedParams.id}/permissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      }
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.log('Erro ao buscar permissões do grupo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/groups/${resolvedParams.id}/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.log('Erro ao definir permissão do grupo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${BACKEND_URL}/api/groups/${resolvedParams.id}/permissions?${queryString}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      }
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.log('Erro ao remover permissão do grupo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
