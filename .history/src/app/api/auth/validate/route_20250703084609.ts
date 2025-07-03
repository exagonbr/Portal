import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Validar token de acesso
 * POST /api/auth/validate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token: bodyToken } = body;

    // Tentar extrair token do body ou dos headers
    const token = bodyToken || extractToken(request);

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token de acesso requerido',
        valid: false
      }, { status: 400 });
    }

    // URL do backend baseada nas variáveis de ambiente
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://127.0.0.1:3001/api';
    const validateUrl = `${backendUrl}/auth/optimized/validate`;

    console.log('🔍 [VALIDATE-API] Validando token');
    console.log('🔗 [VALIDATE-API] URL do backend:', validateUrl);

    // Fazer requisição para o backend
    const response = await fetch(validateUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    console.log('📡 [VALIDATE-API] Resposta do backend:', {
      status: response.status,
      success: data.success,
      valid: data.data?.valid
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Token inválido',
          details: data
        },
        { status: response.status }
      );
    }

    // Verificar se o token não está próximo do vencimento (menos de 5 minutos)
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;
    const isExpiringSoon = timeLeft < 300; // 5 minutos

    return NextResponse.json({
      success: true,
      message: 'Token válido',
      valid: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          status: user.status
        },
        token: {
          type: decoded.type,
          sessionId: decoded.sessionId,
          issuedAt: new Date(decoded.iat * 1000).toISOString(),
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          timeLeft: timeLeft,
          isExpiringSoon: isExpiringSoon
        }
      }
    });

  } catch (error) {
    console.error('Erro na validação do token:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      valid: false
    }, { status: 500 });
  }
}

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
