import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Criar usuários padrão do sistema
 * POST /api/admin/create-default-users
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acesso requerido' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    const user = MOCK_USERS[decoded.email];
    if (!user || user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Apenas administradores do sistema podem criar usuários padrão' },
        { status: 403 }
      );
    }

    // Mock de criação de usuários padrão
    const defaultUsers = [
      {
        id: 'admin_default',
        email: 'admin.default@sabercon.edu.br',
        name: 'Administrador Padrão',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'teacher_default',
        email: 'teacher.default@sabercon.edu.br',
        name: 'Professor Padrão',
        role: 'TEACHER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'student_default',
        email: 'student.default@sabercon.edu.br',
        name: 'Aluno Padrão',
        role: 'STUDENT',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      message: 'Usuários padrão criados com sucesso',
      data: {
        created: defaultUsers,
        count: defaultUsers.length,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar usuários padrão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
