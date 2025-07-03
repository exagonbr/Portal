import { NextRequest, NextResponse } from 'next/server';

import { getInternalApiUrl } from '@/config/env';

export async function POST(request: NextRequest) {
  try {
    const url = `getInternalApiUrl('/api/queue/resume')`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error resuming queue:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}