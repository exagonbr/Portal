import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:3001/api';

export async function GET(request: NextRequest) {
  try {
    const url = `${BACKEND_URL}/queue/next`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching next queue jobs:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}