import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthSession } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest, auth: AuthSession) => {
  try {
    console.log('👤 [AUTH-ME] Verificando informações do usuário:', auth.user.email);

    // Retornar informações do usuário autenticado
    return NextResponse.json({
      success: true,
      message: 'Usuário autenticado',
      data: {
        user: {
          id: auth.user.id,
          email: auth.user.email,
          name: auth.user.name,
          role: auth.user.role,
          permissions: auth.user.permissions,
          avatar: auth.user.avatar,
          status: auth.user.status,
          lastLogin: auth.user.lastLogin,
          createdAt: auth.user.createdAt,
          updatedAt: auth.user.updatedAt
        },
        session: {
          expiresAt: auth.expiresAt,
          permissions: auth.permissions,
          isValid: true
        }
      },
      meta: {
        requestTime: new Date().toISOString(),
        tokenType: 'Bearer',
        authenticated: true
      }
    });

  } catch (error: any) {
    console.error('❌ [AUTH-ME] Erro interno:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
});

export async function OPTIONS() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de verificação de usuário ativa',
      methods: ['GET', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}