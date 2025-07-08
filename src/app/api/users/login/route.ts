import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '../../route-config';
import { getInternalApiUrl } from '@/config/env';

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

    // Usar a função getInternalApiUrl para obter a URL correta do backend
    const backendUrl = getInternalApiUrl('/api/auth/login');
    console.log('🔒 [LOGIN] Tentando autenticar usuário:', email);
    console.log('🔗 [LOGIN] URL do backend:', backendUrl);

    // Fazer requisição para o backend com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

    try {
      const backendResponse = await fetch(backendUrl, {
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
      const contentType = backendResponse.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('❌ [LOGIN] Backend retornou HTML em vez de JSON:', {
          contentType,
          status: backendResponse.status
        });
        return NextResponse.json(
          { 
            success: false, 
            message: 'Erro de comunicação com o servidor de autenticação',
            details: {
              error: 'Backend retornou HTML em vez de JSON',
              contentType,
              status: backendResponse.status
            }
          },
          { 
            status: 502,
            headers: corsHeaders
          }
        );
      }

      const data = await backendResponse.json();
      console.log('📡 [LOGIN] Resposta do backend:', {
        status: backendResponse.status,
        success: data.success,
        hasToken: !!data.data?.accessToken || !!data.accessToken,
        tokenLength: (data.data?.accessToken || data.accessToken || '').length
      });

      if (!backendResponse.ok) {
        console.error('❌ [LOGIN] Erro na resposta do backend:', data.message || 'Erro desconhecido');
        return NextResponse.json(
          { 
            success: false, 
            message: data.message || 'Erro ao fazer login',
            details: data
          },
          { 
            status: backendResponse.status,
            headers: corsHeaders
          }
        );
      }

      // Verificar se o token está presente
      const accessToken = data.data?.accessToken || data.accessToken;
      const refreshToken = data.data?.refreshToken || data.refreshToken;
      
      if (!accessToken) {
        console.error('❌ [LOGIN] Token não encontrado na resposta do backend');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Erro no servidor de autenticação: token não fornecido',
            details: { error: 'TOKEN_MISSING' }
          },
          { 
            status: 500,
            headers: corsHeaders
          }
        );
      }

      // Login bem-sucedido
      console.log('✅ [LOGIN] Login realizado com sucesso para:', email);
      
      // Definir cookies de autenticação para aumentar a compatibilidade
      const clientResponse = NextResponse.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          accessToken,
          refreshToken,
          user: data.data?.user || data.user,
          expiresIn: data.data?.expiresIn || data.expiresIn
        }
      }, {
        headers: {
          ...corsHeaders,
          'Set-Cookie': `accessToken=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
        }
      });

      return clientResponse;

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Verificar se é um erro de timeout
      if (fetchError.name === 'AbortError') {
        console.error('⏱️ [LOGIN] Timeout na comunicação com o servidor de autenticação');
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
      
      // Verificar se é um erro de conexão recusada (ECONNREFUSED)
      const errorMessage = String(fetchError);
      if (errorMessage.includes('ECONNREFUSED')) {
        console.error('🔌 [LOGIN] Conexão recusada pelo servidor de autenticação:', errorMessage);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Não foi possível conectar ao servidor de autenticação',
            details: {
              error: 'ECONNREFUSED',
              message: errorMessage
            }
          },
          { 
            status: 503,
            headers: corsHeaders
          }
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error('❌ [LOGIN] Erro interno:', error.message, error.stack);
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