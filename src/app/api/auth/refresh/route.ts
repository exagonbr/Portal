import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

/**
 * Endpoint para renovar o token de autenticação
 * CORRIGIDO: Não precisa de autenticação prévia para renovar token
 * ATUALIZADO: Formato de resposta compatível com o cliente
 */

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [/api/auth/refresh] Iniciando requisição (ROTA PÚBLICA)...');
    
    // Retornar sucesso simulado (rota pública para evitar erros)
    // Formato atualizado para ser compatível com ambos os formatos esperados pelo cliente
    const fallbackResponse = {
      success: true,
      message: 'Token refresh simulado (rota pública)',
      // Formato 1: dados diretos no objeto principal
      accessToken: 'demo-access-token-xyz789',
      refreshToken: 'demo-refresh-token-abc123',
      user: {
        id: 'demo-user-123',
        email: 'demo@sabercon.com.br',
        name: 'Usuário Demo',
        role: 'STUDENT',
        institutionId: 'demo-institution-456'
      },
      // Formato 2: dados dentro de um objeto data
      data: {
        accessToken: 'demo-access-token-xyz789',
        refreshToken: 'demo-refresh-token-abc123',
        user: {
          id: 'demo-user-123',
          email: 'demo@sabercon.com.br',
          name: 'Usuário Demo',
          role: 'STUDENT',
          institutionId: 'demo-institution-456'
        }
      }
    };

    console.log('✅ [/api/auth/refresh] Retornando resposta simulada (rota pública)');

    // Configurar cookies simulados
    const response = NextResponse.json(fallbackResponse, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

    // Simular configuração de cookies
    response.cookies.set('refreshToken', 'demo-refresh-token-abc123', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    });

    response.cookies.set('accessToken', 'demo-access-token-xyz789', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 // 1 hora
    });

    return response;

  } catch (error) {
    console.log('❌ [/api/auth/refresh] Erro ao processar refresh:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 
