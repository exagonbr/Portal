// NextAuth desabilitado - redirecionando para sistema de autenticação customizado
// Esta rota redireciona para o sistema de autenticação customizado

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url);
  
  // Se for uma tentativa de login, redirecionar para nossa API customizada
  if (pathname.includes('signin') || pathname.includes('login')) {
    console.log('🔄 [NEXTAUTH-REDIRECT] Redirecionando login para sistema customizado');
    
    // Redirecionar para página de login customizada
    const loginUrl = new URL('/auth/login', request.url);
    if (searchParams.get('callbackUrl')) {
      loginUrl.searchParams.set('callbackUrl', searchParams.get('callbackUrl')!);
    }
    
    return NextResponse.redirect(loginUrl);
  }
  
  // Para outras rotas do NextAuth, usar nossa API customizada
  console.log('🔄 [NEXTAUTH-REDIRECT] Usando sistema de autenticação customizado');
  
  return NextResponse.json(
    { 
      success: true,
      message: 'Sistema de autenticação customizado ativo',
      redirect: '/api/auth/login',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  // Se for uma tentativa de login via POST, usar nossa API
  if (pathname.includes('signin') || pathname.includes('login') || pathname.includes('callback')) {
    console.log('🔄 [NEXTAUTH-REDIRECT] Redirecionando POST login para sistema customizado');
    
    try {
      const body = await request.json();
      
      // Redirecionar para nossa API de login
      const loginUrl = new URL('/api/auth/login', request.url);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
      
    } catch (error) {
      console.error('❌ [NEXTAUTH-REDIRECT] Erro ao redirecionar login:', error);
    }
  }
  
  return NextResponse.json(
    { 
      success: true,
      message: 'Sistema de autenticação customizado ativo',
      redirect: '/api/auth/login',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}