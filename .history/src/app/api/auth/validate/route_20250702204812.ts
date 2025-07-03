import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obter token do header Authorization
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token não fornecido' 
        },
        { status: 401 }
      );
    }

    // URL do backend baseada nas variáveis de ambiente
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
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

    // Token válido
    return NextResponse.json({
      success: true,
      message: 'Token válido',
      data: {
        valid: data.data.valid,
        user: data.data.user
      }
    });

  } catch (error: any) {
    console.log('❌ [VALIDATE-API] Erro na validação:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        details: {
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Permitir POST também para compatibilidade
  return GET(request);
}
