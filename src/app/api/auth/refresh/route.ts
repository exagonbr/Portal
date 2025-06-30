import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getInternalApiUrl } from '@/config/env';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

/**
 * Endpoint para renovar o token de autenticação
 */

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    console.log('🔄 API Refresh: Iniciando renovação de token');

    if (!refreshToken) {
      console.log('❌ API Refresh: Refresh token não encontrado');
      return NextResponse.json(
        { success: false, message: 'Refresh token não encontrado' },
        { status: 401 }
      );
    }

    // Enviar requisição para o backend para renovar o token
    console.log(`🔄 API Refresh: Chamando backend em ${getInternalApiUrl('/auth/optimized/refresh')}`);
    
    const response = await fetch(getInternalApiUrl('/auth/optimized/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
        sessionId
      }),
      cache: 'no-store',
    });

    console.log(`📡 API Refresh: Resposta do backend: ${response.status}`);

    if (!response.ok) {
      // Se o refresh token é inválido, limpar todos os cookies
      if (response.status === 401) {
        console.log('🔄 API Refresh: Token expirado, limpando cookies');
        
        const newResponse = NextResponse.json(
          { success: false, message: 'Sessão expirada, por favor faça login novamente' },
          { status: 401 }
        );
        
        // Limpar cookies
        const cookiesToClear = ['auth_token', 'refresh_token', 'session_id', 'user_data'];
        cookiesToClear.forEach(cookieName => {
          newResponse.cookies.set(cookieName, '', {
            expires: new Date(0),
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        });
        
        return newResponse;
      }
      
      console.error(`❌ API Refresh: Erro ${response.status} ao renovar token`);
      return NextResponse.json(
        { success: false, message: 'Erro ao renovar token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      console.error('❌ API Refresh: Resposta inválida do backend:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Erro desconhecido' },
        { status: 500 }
      );
    }

    const { token, expires_at, refreshToken: newRefreshToken } = data.data;
    
    console.log('✅ API Refresh: Token renovado com sucesso');
    
    // Criar resposta com novos cookies
    const responseObj = NextResponse.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token,
        expires_at
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

    // Configurar cookies
    responseObj.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas (86400 segundos)
      path: '/',
    });
    
    if (newRefreshToken) {
      responseObj.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias (604800 segundos)
        path: '/',
      });
    }

    return responseObj;
  } catch (error) {
    console.error('❌ API Refresh: Erro crítico ao renovar token:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
