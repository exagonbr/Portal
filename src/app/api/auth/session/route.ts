import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    // Para login do Google via NextAuth
    const session = await getServerSession();
    
    if (session) {
      return NextResponse.json(session);
    } else {
      // Retorna um objeto de sessão vazio em vez de status 401
      // Isso evita que o cliente exiba erros
      return NextResponse.json({ 
        user: null, 
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
      });
    }
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 