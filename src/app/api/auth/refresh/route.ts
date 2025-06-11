import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api';

/**
 * Endpoint para renovar o token de autenticação
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token não encontrado' },
        { status: 401 }
      );
    }

    // Enviar requisição para o backend para renovar o token
    const response = await fetch(`${BACKEND_URL}/v1/auth/refresh-token`, {
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

    if (!response.ok) {
      // Se o refresh token é inválido, limpar todos os cookies
      if (response.status === 401) {
        const newResponse = NextResponse.json(
          { success: false, message: 'Sessão expirada, por favor faça login novamente' },
          { status: 401 }
        );
        
        // Limpar cookies
        newResponse.cookies.delete('auth_token');
        newResponse.cookies.delete('refresh_token');
        newResponse.cookies.delete('session_id');
        newResponse.cookies.delete('user_data');
        
        return newResponse;
      }
      
      return NextResponse.json(
        { success: false, message: 'Erro ao renovar token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      return NextResponse.json(
        { success: false, message: data.message || 'Erro desconhecido' },
        { status: 500 }
      );
    }

    const { token, expires_at, refreshToken: newRefreshToken } = data.data;
    
    // Criar resposta com novos cookies
    const responseObj = NextResponse.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token,
        expires_at
      }
    });

    // Configurar cookies
    responseObj.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });
    
    if (newRefreshToken) {
      responseObj.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/',
      });
    }

    return responseObj;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 