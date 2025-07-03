import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, extractDeviceInfo, extractClientIP } from '@/middleware/auth';

/**
 * Registrar novo usuário
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'STUDENT' } = body;

    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: 'Email, senha e nome são obrigatórios'
      }, { status: 400 });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Formato de email inválido'
      }, { status: 400 });
    }

    // Validar senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      }, { status: 400 });
    }

    // Extrair informações do dispositivo e IP
    const deviceInfo = extractDeviceInfo(request);
    const ipAddress = extractClientIP(request);

    // Simular registro (em produção, criar usuário no banco)
    // Por enquanto, retornar erro pois não temos sistema de registro implementado
    return NextResponse.json({
      success: false,
      message: 'Registro de novos usuários não está disponível no momento'
    }, { status: 501 });

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
