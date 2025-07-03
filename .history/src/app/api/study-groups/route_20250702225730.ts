import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Obter grupos de estudo
 * GET /api/study-groups
 */
export async function GET(request: NextRequest) {
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
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');
    const courseId = url.searchParams.get('courseId');

    // Mock de grupos de estudo
    const mockStudyGroups = [
      {
        id: '1',
        name: 'Grupo de Matemática Avançada',
        description: 'Estudo colaborativo de cálculo diferencial e integral',
        courseId: '1',
        courseName: 'Matemática Avançada',
        createdBy: '2',
        createdByName: 'Prof. João Silva',
        status: 'ACTIVE',
        privacy: 'PUBLIC',
        maxMembers: 15,
        currentMembers: 8,
        members: [
          { id: '3', name: 'Maria Santos', role: 'MEMBER', joinedAt: '2025-01-01T10:00:00Z' },
          { id: '4', name: 'Pedro Costa', role: 'MODERATOR', joinedAt: '2025-01-02T14:30:00Z' },
          { id: '5', name: 'Ana Silva', role: 'MEMBER', joinedAt: '2025-01-03T09:15:00Z' }
        ],
        schedule: {
          meetingDay: 'WEDNESDAY',
          meetingTime: '19:00',
          duration: 120, // minutes
          location: 'Sala Virtual 1'
        },
        tags: ['matemática', 'cálculo', 'estudo-grupo'],
        createdAt: '2024-12-15T10:00:00Z',
        updatedAt: '2025-01-07T15:30:00Z'
      },
      {
        id: '2',
        name: 'Física Quântica - Discussões',
        description: 'Debates e resolução de exercícios de física quântica',
        courseId: '2',
        courseName: 'Física Quântica',
        createdBy: '6',
        createdByName: 'Prof. Carlos Mendes',
        status: 'ACTIVE',
        privacy: 'PRIVATE',
        maxMembers: 10,
        currentMembers: 6,
        members: [
          { id: '7', name: 'Lucas Oliveira', role: 'MEMBER', joinedAt: '2025-01-05T11:00:00Z' },
          { id: '8', name: 'Fernanda Lima', role: 'MEMBER', joinedAt: '2025-01-06T16:45:00Z' }
        ],
        schedule: {
          meetingDay: 'FRIDAY',
          meetingTime: '20:00',
          duration: 90,
          location: 'Laboratório de Física'
        },
        tags: ['física', 'quântica', 'laboratório'],
        createdAt: '2024-12-20T14:00:00Z',
        updatedAt: '2025-01-06T18:20:00Z'
      },
      {
        id: '3',
        name: 'Programação Web - Projetos',
        description: 'Desenvolvimento colaborativo de projetos web',
        courseId: '3',
        courseName: 'Desenvolvimento Web',
        createdBy: '9',
        createdByName: 'Prof. Tech Master',
        status: 'RECRUITING',
        privacy: 'PUBLIC',
        maxMembers: 20,
        currentMembers: 12,
        members: [],
        schedule: {
          meetingDay: 'SATURDAY',
          meetingTime: '14:00',
          duration: 180,
          location: 'Lab de Informática'
        },
        tags: ['programação', 'web', 'projetos', 'javascript'],
        createdAt: '2025-01-01T09:00:00Z',
        updatedAt: '2025-01-07T12:00:00Z'
      }
    ];

    let filteredGroups = mockStudyGroups;

    if (status) {
      filteredGroups = filteredGroups.filter(group => group.status === status);
    }

    if (courseId) {
      filteredGroups = filteredGroups.filter(group => group.courseId === courseId);
    }

    const paginatedGroups = filteredGroups.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      message: 'Grupos de estudo obtidos com sucesso',
      data: {
        groups: paginatedGroups,
        pagination: {
          total: filteredGroups.length,
          limit,
          offset,
          hasMore: offset + limit < filteredGroups.length
        },
        summary: {
          total: mockStudyGroups.length,
          active: mockStudyGroups.filter(g => g.status === 'ACTIVE').length,
          recruiting: mockStudyGroups.filter(g => g.status === 'RECRUITING').length,
          totalMembers: mockStudyGroups.reduce((sum, g) => sum + g.currentMembers, 0)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter grupos de estudo:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Criar novo grupo de estudo
 * POST /api/study-groups
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
    if (!user || !user.permissions.includes('study-groups.create')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      courseId, 
      privacy, 
      maxMembers, 
      schedule, 
      tags 
    } = body;

    if (!name || !description || !courseId) {
      return NextResponse.json(
        { success: false, message: 'Nome, descrição e curso são obrigatórios' },
        { status: 400 }
      );
    }

    // Mock de criação de grupo
    const newGroup = {
      id: Date.now().toString(),
      name,
      description,
      courseId,
      courseName: 'Curso Exemplo',
      createdBy: user.id,
      createdByName: user.name,
      status: 'RECRUITING',
      privacy: privacy || 'PUBLIC',
      maxMembers: maxMembers || 15,
      currentMembers: 1,
      members: [
        {
          id: user.id,
          name: user.name,
          role: 'OWNER',
          joinedAt: new Date().toISOString()
        }
      ],
      schedule: schedule || {
        meetingDay: 'SATURDAY',
        meetingTime: '14:00',
        duration: 120,
        location: 'A definir'
      },
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Grupo de estudo criado com sucesso',
      data: newGroup
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar grupo de estudo:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
