import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authOptionsDebug, debugAuthConfig, testSession } from '@/lib/auth-debug';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG-AUTH] Iniciando diagnóstico de autenticação...');
    
    // 1. Verificar configuração
    const config = debugAuthConfig();
    
    // 2. Testar sessão com configuração original
    console.log('🧪 [DEBUG-AUTH] Testando sessão com authOptions original...');
    const originalSession = await getServerSession(authOptions);
    
    // 3. Testar sessão com configuração de debug
    console.log('🧪 [DEBUG-AUTH] Testando sessão com authOptionsDebug...');
    const debugSession = await getServerSession(authOptionsDebug);
    
    // 4. Verificar cookies
    const cookies = request.headers.get('cookie') || '';
    const authCookies = cookies.split(';')
      .filter(cookie => cookie.includes('next-auth') || cookie.includes('auth'))
      .map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return {
          name,
          hasValue: !!value,
          valueLength: value?.length || 0,
          valuePreview: value ? value.substring(0, 20) + '...' : 'empty'
        };
      });
    
    // 5. Verificar headers de autorização
    const authHeader = request.headers.get('authorization');
    const hasAuthHeader = !!authHeader;
    const authHeaderType = authHeader ? authHeader.split(' ')[0] : null;
    
    // 6. Informações da requisição
    const requestInfo = {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      origin: request.headers.get('origin')
    };
    
    const diagnosticResult = {
      timestamp: new Date().toISOString(),
      config,
      sessions: {
        original: {
          hasSession: !!originalSession,
          userEmail: originalSession?.user?.email,
          userRole: (originalSession?.user as any)?.role,
          permissionsCount: Array.isArray((originalSession?.user as any)?.permissions) 
            ? (originalSession?.user as any).permissions.length 
            : 0
        },
        debug: {
          hasSession: !!debugSession,
          userEmail: debugSession?.user?.email,
          userRole: (debugSession?.user as any)?.role,
          permissionsCount: Array.isArray((debugSession?.user as any)?.permissions) 
            ? (debugSession?.user as any).permissions.length 
            : 0
        }
      },
      cookies: {
        total: cookies.split(';').length,
        authCookies,
        rawCookies: cookies
      },
      authorization: {
        hasAuthHeader,
        authHeaderType,
        authHeaderPreview: authHeader ? authHeader.substring(0, 30) + '...' : null
      },
      request: requestInfo,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    };
    
    console.log('✅ [DEBUG-AUTH] Diagnóstico completo:', diagnosticResult);
    
    return NextResponse.json({
      success: true,
      message: 'Diagnóstico de autenticação completo',
      data: diagnosticResult
    });
    
  } catch (error) {
    console.error('❌ [DEBUG-AUTH] Erro no diagnóstico:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro no diagnóstico de autenticação',
      error: {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}

// Rota POST para testar login com credenciais
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log('🔐 [DEBUG-AUTH] Testando login com credenciais:', email);
    
    // Simular verificação de credenciais
    const isValidCredentials = email === 'admin@sabercon.com.br' && password === 'admin123';
    
    if (isValidCredentials) {
      const mockUser = {
        id: 'debug-admin',
        email,
        name: 'Admin Debug',
        role: 'SYSTEM_ADMIN',
        permissions: [
          'system.admin',
          'units.manage',
          'institutions.manage',
          'users.manage'
        ]
      };
      
      return NextResponse.json({
        success: true,
        message: 'Credenciais válidas (simulação)',
        user: mockUser
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Credenciais inválidas'
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('❌ [DEBUG-AUTH] Erro no teste de login:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro no teste de login',
      error: {
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }, { status: 500 });
  }
}