import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email e senha são obrigatórios' 
        },
        { status: 400 }
      );
    }

    // URL do backend baseada nas variáveis de ambiente
    const backendUrl = 'http://localhost:3001/api';
    const loginUrl = `${backendUrl}/auth/optimized/login`;

    console.log('🔐 [LOGIN-API] Tentativa de login para:', email);
    console.log('🔗 [LOGIN-API] URL do backend:', loginUrl);

    // Fazer requisição para o backend
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log('📡 [LOGIN-API] Resposta do backend:', {
      status: response.status,
      success: data.success,
      hasToken: !!data.data?.token
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Erro ao fazer login',
          details: data
        },
        { status: response.status }
      );
    }

    // Login bem-sucedido
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token: data.token || data.data?.token,
        refreshToken: data.refreshToken || data.data?.refreshToken,
        user: data.user || data.data?.user,
        expiresIn: data.expiresIn || data.data?.expiresIn
      }
    });

  } catch (error: any) {
    console.log('❌ [LOGIN-API] Erro no login:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        details: {
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de login customizada ativa',
      timestamp: new Date().toISOString()
    }
  );
}
