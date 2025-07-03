import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Route moved',
      message: 'Esta rota foi movida para /api/auth/login',
      correct_endpoint: '/api/auth/login'
    },
    { status: 301 }
  );
}

export async function POST(request: NextRequest) {
  console.warn('🚨 Requisição incorreta para /auth/login - deve usar /api/auth/login');
  
  try {
    const body = await request.json();
    
    // Redireciona para a rota correta
    const correctUrl = new URL('/api/auth/login', request.url);
    
    const response = await fetch(correctUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erro ao redirecionar para API correta:', error);
    return NextResponse.json(
      { 
        error: 'Route moved',
        message: 'Esta rota foi movida para /api/auth/login',
        correct_endpoint: '/api/auth/login'
      },
      { status: 301 }
    );
  }
} 