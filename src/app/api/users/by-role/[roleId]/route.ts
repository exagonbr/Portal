import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../../lib/auth-headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/users?role_id=${params.roleId}`, {
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