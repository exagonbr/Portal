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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const loginUrl = `${backendUrl}/auth/optimized/login`;

    console.log('🔐 [LOGIN-API] Tentativa de login para:', email);
    console.log('🔗 [LOGIN-API] URL do backend:', loginUrl);
    console.log('🔍 [LOGIN-API] Variáveis de ambiente:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV
    });

    // Verificar se o backend está acessível antes de fazer a requisição principal
    try {
      const healthCheck = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // Timeout de 5 segundos
      });
      
      console.log('🏥 [LOGIN-API] Health check status:', healthCheck.status);
    } catch (healthError: any) {
      console.log('❌ [LOGIN-API] Erro no health check:', healthError.name, healthError.message);
      // Continuar mesmo com falha no health check
    }

    // Fazer requisição para o backend com timeout
    console.log('📡 [LOGIN-API] Iniciando requisição de login...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
    
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
          token: data.token || data.data?.token,
          refreshToken: data.refreshToken || data.data?.refreshToken,
          user: data.user || data.data?.user,
          expiresIn: data.expiresIn || data.data?.expiresIn
        }
      }, {
        headers: corsHeaders
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError; // Propagar o erro para ser tratado no catch externo
    }

  } catch (error: any) {
    console.log('❌ [LOGIN-API] Erro no login:', error.name, error.message);
    console.log('❌ [LOGIN-API] Stack:', error.stack);
    
    // Verificar se é um erro de timeout
    const isTimeout = error.name === 'AbortError' || error.message.includes('timeout');
    
    // Verificar se é um erro de conexão
    const isConnectionError = 
      error.message.includes('ECONNREFUSED') || 
      error.message.includes('fetch failed') ||
      error.message.includes('network') ||
      error.message.includes('connection');
    
    let errorMessage = 'Erro interno do servidor';
    let errorStatus = 500;
    
    if (isTimeout) {
      errorMessage = 'Tempo limite excedido ao conectar ao servidor de autenticação';
      errorStatus = 504; // Gateway Timeout
    } else if (isConnectionError) {
      errorMessage = 'Não foi possível conectar ao servidor de autenticação';
      errorStatus = 503; // Service Unavailable
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        details: {
          error: error.message,
          type: error.name,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { 
        status: errorStatus,
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
