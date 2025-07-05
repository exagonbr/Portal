import { NextRequest, NextResponse } from 'next/server';
import { runAuthDiagnostics, autoRepairAuth } from '@/utils/auth-diagnostic';

/**
 * Middleware para interceptar e corrigir automaticamente problemas de autenticação
 */
export async function authInterceptor(request: NextRequest): Promise<NextResponse | null> {
  const url = request.nextUrl.pathname;
  
  // Lista de endpoints que precisam de autenticação
  const protectedEndpoints = [
    '/api/dashboard',
    '/api/users/stats',
    '/api/institutions',
    '/api/aws/connection-logs',
    '/api/auth/refresh'
  ];

  // Verificar se é um endpoint protegido
  const isProtectedEndpoint = protectedEndpoints.some(endpoint => 
    url.startsWith(endpoint)
  );

  if (!isProtectedEndpoint) {
    return null; // Continuar normalmente
  }

  // Extrair token do header Authorization
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Token de autenticação não fornecido',
        code: 'NO_TOKEN'
      },
      { status: 401 }
    );
  }

  try {
    // Executar diagnóstico rápido do token
    const diagnostics = await runAuthDiagnostics();
    
    // Se token está expirado, tentar renovação automática
    if (diagnostics.tokenExpired && !diagnostics.tokenValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token expirado - renovação necessária',
          code: 'TOKEN_EXPIRED',
          shouldRefresh: true
        },
        { status: 401 }
      );
    }

    // Se token é inválido
    if (!diagnostics.tokenValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token inválido',
          code: 'INVALID_TOKEN',
          shouldClearAuth: true
        },
        { status: 401 }
      );
    }

    // Token válido, continuar normalmente
    return null;

  } catch (error) {
    console.error('Erro no interceptor de auth:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno durante validação de autenticação',
        code: 'AUTH_VALIDATION_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * Handler para resposta de erro 401 personalizada
 */
export function create401Response(message: string, code?: string, metadata?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      code: code || 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
      ...metadata
    },
    { 
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer realm="API"'
      }
    }
  );
}

/**
 * Handler para resposta de erro 500 personalizada
 */
export function create500Response(message: string, code?: string, details?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      code: code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {})
    },
    { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
} 