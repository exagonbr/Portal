import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    
    // Obter a URL base
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    
    // Redirecionar para o endpoint do NextAuth para Google
    const nextAuthGoogleUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    
    // Como o NextAuth já gerencia o Google provider, vamos redirecionar para ele
    const signInUrl = `${baseUrl}/api/auth/signin?provider=google&callbackUrl=${encodeURIComponent(callbackUrl)}`;
    
    return NextResponse.redirect(signInUrl);
  } catch (error) {
    console.error('Erro no signin com Google:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
} 