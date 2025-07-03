import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Obter usuários por papel/role
 * GET /api/users/by-role/[roleId]
 */
export async function GET(request: NextRequest, { params }: { params: { roleId: string } }) {
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
    if (!user || !user.permissions.includes('users.view')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    const { roleId } = params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    if (!roleId) {
      return NextResponse.json(
        { success: false, message: 'ID do papel é obrigatório' },
        { status: 400 }
      );
    }

    // Mapear roleId para nome do papel
    const roleNames: { [key: string]: string } = {
      '1': 'SYSTEM_ADMIN',
      '2': 'ADMIN',
      '3': 'TEACHER',
      '4': 'STUDENT',
      '5': 'COORDINATOR',
      '6': 'GUARDIAN'
    };

    const roleName = roleNames[roleId] || 'STUDENT';

    // Mock de usuários por papel
    const mockUsersByRole = [
      {
        id: '1',
        name: 'Administrador do Sistema',
        email: 'admin@sabercon.edu.br',
        role: 'SYSTEM_ADMIN',
        status: 'ACTIVE',
        avatar: '/avatars/admin.jpg',
        institutionId: null,
        institutionName: null,
        createdAt: '2024-01-01T00:00:00Z',
        lastLogin: '2025-01-07T20:30:00Z',
        permissions: ['system.manage', 'institutions.manage', 'users.manage.global']
      },
      {
        id: '2',
        name: 'Prof. João Silva',
        email: 'joao.silva@sabercon.edu.br',
        role: 'TEACHER',
        status: 'ACTIVE',
        avatar: '/avatars/joao.jpg',
        institutionId: '1',
        institutionName: 'Universidade Sabercon',
        createdAt: '2024-02-15T10:00:00Z',
        lastLogin: '2025-01-07T18:45:00Z',
        permissions: ['courses.manage', 'assignments.create', 'grades.manage'],
        specialization: 'Matemática',
        department: 'Ciências Exatas'
      },
      {
        id: '3',
        name: 'Maria Santos',
        email: 'maria.santos@student.sabercon.edu.br',
        role: 'STUDENT',
        status: 'ACTIVE',
        avatar: '/avatars/maria.jpg',
        institutionId: '1',
        institutionName: 'Universidade Sabercon',
        createdAt: '2024-03-01T14:30:00Z',
        lastLogin: '2025-01-07T19:15:00Z',
        permissions: ['courses.view', 'assignments.submit', 'grades.view'],
        course: 'Engenharia de Software',
        semester: 6
      },
      {
        id: '4',
        name: 'Dr. Carlos Mendes',
        email: 'carlos.mendes@sabercon.edu.br',
        role: 'COORDINATOR',
        status: 'ACTIVE',
        avatar: '/avatars/carlos.jpg',
        institutionId: '1',
        institutionName: 'Universidade Sabercon',
        createdAt: '2024-01-20T09:00:00Z',
        lastLogin: '2025-01-07T17:20:00Z',
        permissions: ['courses.coordinate', 'teachers.manage', 'curriculum.manage'],
        department: 'Coordenação Acadêmica',
        courses: ['Física Quântica', 'Mecânica Clássica']
      },
      {
        id: '5',
        name: 'Ana Costa',
        email: 'ana.costa@guardian.sabercon.edu.br',
        role: 'GUARDIAN',
        status: 'ACTIVE',
        avatar: '/avatars/ana.jpg',
        institutionId: '1',
        institutionName: 'Universidade Sabercon',
        createdAt: '2024-04-10T16:00:00Z',
        lastLogin: '2025-01-06T21:30:00Z',
        permissions: ['children.view', 'grades.view', 'meetings.schedule'],
        children: [
          { id: '3', name: 'Maria Santos', relationship: 'Filha' }
        ]
      }
    ];

    // Filtrar por papel
    let filteredUsers = mockUsersByRole.filter(u => u.role === roleName);

    // Filtrar por status se fornecido
    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status);
    }

    // Filtrar por busca se fornecido
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }

    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      message: 'Usuários por papel obtidos com sucesso',
      data: {
        users: paginatedUsers,
        role: {
          id: roleId,
          name: roleName,
          displayName: getRoleDisplayName(roleName)
        },
        pagination: {
          total: filteredUsers.length,
          limit,
          offset,
          hasMore: offset + limit < filteredUsers.length
        },
        summary: {
          total: filteredUsers.length,
          active: filteredUsers.filter(u => u.status === 'ACTIVE').length,
          inactive: filteredUsers.filter(u => u.status === 'INACTIVE').length,
          pending: filteredUsers.filter(u => u.status === 'PENDING').length
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter usuários por papel:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getRoleDisplayName(role: string): string {
  const displayNames: { [key: string]: string } = {
    'SYSTEM_ADMIN': 'Administrador do Sistema',
    'ADMIN': 'Administrador',
    'TEACHER': 'Professor',
    'STUDENT': 'Aluno',
    'COORDINATOR': 'Coordenador',
    'GUARDIAN': 'Responsável'
  };
  
  return displayNames[role] || role;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}