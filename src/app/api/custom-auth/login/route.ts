import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '../../route-config';

// Configuração da rota como pública e dinâmica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

// Handler para requisições OPTIONS (preflight CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Length': '0',
    },
  });
}

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
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // URL do backend baseada nas variáveis de ambiente
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001/api';
    const loginUrl = `${backendUrl}/users/login`;

    console.log('🔐 [CUSTOM-AUTH-LOGIN] Tentativa de login para:', email);
    console.log('🔗 [CUSTOM-AUTH-LOGIN] URL do backend:', loginUrl);

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

    console.log('📡 [CUSTOM-AUTH-LOGIN] Resposta do backend:', {
      status: response.status,
      success: data.success,
      hasToken: !!data.data?.token || !!data.token
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Erro ao fazer login',
          details: data
        },
        { 
          status: response.status,
          headers: corsHeaders
        }
      );
    }

    // Login bem-sucedido
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        accessToken: data.data?.accessToken || data.accessToken,
        refreshToken: data.data?.refreshToken || data.refreshToken,
        user: data.data?.user || data.user,
        expiresIn: data.data?.expiresIn || data.expiresIn
      }
    }, {
      headers: corsHeaders
    });

  } catch (error: any) {
    console.log('❌ [CUSTOM-AUTH-LOGIN] Erro no login:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        details: {
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de login customizada ativa - ROTA PÚBLICA',
      timestamp: new Date().toISOString(),
      public: true
    },
    {
      headers: corsHeaders
    }
  );
}