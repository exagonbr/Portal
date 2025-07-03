import { NextResponse } from 'next/server';

export async function GET() {
  console.warn('🚨 Requisição incorreta para /user-classes - deve usar backend diretamente em http://localhost:3001/api/user-classes');
  
  return NextResponse.json(
    { 
      error: 'Route moved',
      message: 'Esta rota deve ser acessada diretamente no backend',
      correct_endpoint: 'http://localhost:3001/api/user-classes',
      note: 'Use o apiClient ou userClassService do frontend para fazer estas requisições'
    },
    { status: 404 }
  );
}

export async function POST() {
  return GET();
}

export async function PUT() {
  return GET();
}

export async function DELETE() {
  return GET();
} 