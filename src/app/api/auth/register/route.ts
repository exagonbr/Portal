import { NextRequest, NextResponse } from 'next/server';

/**
 * Registrar novo usuário
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = 'STUDENT' } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // TODO: Implementar lógica de registro
    // Por enquanto, retorna um mock
    return NextResponse.json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: {
          id: 'new_user_id',
          name,
          email,
          role,
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
