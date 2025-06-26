import { NextRequest, NextResponse } from 'next/server';

import { getInternalApiUrl } from '@/config/env';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const response = await fetch(`getInternalApiUrl('/api/api/aws/settings/${params.id}/test-connection')`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Portal-Frontend',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erro ao testar conexão AWS:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 