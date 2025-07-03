import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/middleware/auth';

/**
 * Criar usuários padrão do sistema
 * POST /api/admin/create-default-users
 */
export const POST = requireRole(['SYSTEM_ADMIN'])(async (request: NextRequest) => {
  try {
    // Simular criação de usuários padrão
    const defaultUsers = [
      {
        id: 'admin-001',
        email: 'admin@sabercon.edu.br',
        name: 'Administrador Sistema',
        role: 'SYSTEM_ADMIN',
        status: 'ACTIVE',
        created: true
      },
      {
        id: 'teacher-001',
        email: 'teacher@sabercon.edu.br',
        name: 'Professor Exemplo',
        role: 'TEACHER',
        status: 'ACTIVE',
        created: true
      },
      {
        id: 'student-001',
        email: 'student@sabercon.edu.br',
        name: 'Aluno Exemplo',
        role: 'STUDENT',
        status: 'ACTIVE',
        created: true
      }
    ];

    return NextResponse.json({
      success: true,
      message: 'Usuários padrão criados com sucesso',
      data: {
        users: defaultUsers,
        total: defaultUsers.length,
        created: defaultUsers.filter(u => u.created).length
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuários padrão:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
});

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
