import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from '@/config/cors';
import { JWT_CONFIG } from '@/config/jwt';
import * as jwt from 'jsonwebtoken';

interface RefreshTokenPayload {
  id: string;
  sessionId: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  institutionId?: number;
}

/**
 * POST /api/auth/refresh
 * Renova access token usando refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Refresh token é obrigatório' 
        },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Validar refresh token
    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(refreshToken, JWT_CONFIG.JWT_SECRET) as RefreshTokenPayload;
    } catch (error) {
      console.error('❌ Refresh token inválido:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Refresh token inválido ou expirado' 
        },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Verificar se é um refresh token
    if (decoded.type !== 'refresh') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token não é um refresh token válido' 
        },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Verificar se a sessão ainda existe (aqui você pode implementar 
    // verificação contra banco de dados ou Redis se necessário)
    const sessionId = decoded.sessionId;
    const userId = decoded.id;

    // Simular busca de dados do usuário (em produção, buscar do banco)
    // Por enquanto, vamos usar dados mock baseados no token
    const userData: UserData = {
      id: userId,
      email: `user${userId}@exemplo.com`, // Em produção, buscar do banco
      name: `Usuário ${userId}`, // Em produção, buscar do banco
      role: 'SYSTEM_ADMIN', // Em produção, buscar do banco
      permissions: ['all'], // Em produção, buscar do banco
    };

    // Gerar novo access token
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 60 * 60; // 1 hora
    const accessTokenPayload = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      permissions: userData.permissions,
      sessionId: sessionId,
      type: 'access',
      iat: now,
      exp: now + expiresIn
    };

    const newAccessToken = jwt.sign(
      accessTokenPayload,
      JWT_CONFIG.JWT_SECRET,
      {
        algorithm: JWT_CONFIG.ALGORITHM,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE
      }
    );

    // Gerar novo refresh token (opcional - para rotação)
    const newRefreshTokenPayload: RefreshTokenPayload = {
      id: userId,
      sessionId: sessionId,
      type: 'refresh'
    };

    const newRefreshToken = jwt.sign(
      newRefreshTokenPayload,
      JWT_CONFIG.JWT_SECRET,
      {
        expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY || '7d',
        algorithm: JWT_CONFIG.ALGORITHM,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE
      }
    );

    console.log('✅ Tokens renovados com sucesso para usuário:', userData.email);

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: (now + expiresIn) * 1000, // Converter para milissegundos
      expiresIn: expiresIn,
      user: userData
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ Erro interno no refresh de token:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// Suportar OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin') || undefined)
  });
} 
