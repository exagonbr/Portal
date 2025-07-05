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

    // CORREÇÃO: Usar localhost para o backend real, não a URL do frontend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001/api';
    const loginUrl = `${backendUrl}/users/login`;

    console.log('🔐 [USERS-LOGIN] Tentativa de login para:', email);
    console.log('🔗 [USERS-LOGIN] URL do backend:', loginUrl);
    console.log('🔍 [USERS-LOGIN] Evitando loop - usando backend real');

    // Fazer requisição para o backend REAL com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Verificar se a resposta é HTML (indicando erro de roteamento)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.log('❌ [USERS-LOGIN] Recebido HTML em vez de JSON - possível erro de roteamento');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Erro de comunicação com o servidor de autenticação',
            details: {
              error: 'Backend retornou HTML em vez de JSON',
              contentType,
              status: response.status
            }
          },
          { 
            status: 502,
            headers: corsHeaders
          }
        );
      }

      const data = await response.json();

      console.log('📡 [USERS-LOGIN] Resposta do backend:', {
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

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Verificar se é um erro de timeout
      if (fetchError.name === 'AbortError') {
        console.log('❌ [USERS-LOGIN] Timeout na requisição para o backend');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Timeout na comunicação com o servidor de autenticação',
            details: {
              error: 'Timeout após 30 segundos',
              type: 'AbortError'
            }
          },
          { 
            status: 504,
            headers: corsHeaders
          }
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.log('❌ [USERS-LOGIN] Erro no login:', error);
    
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
      message: 'API de login de usuários ativa - ROTA PÚBLICA',
      timestamp: new Date().toISOString(),
      public: true
    },
    {
      headers: corsHeaders
    }
  );
} 