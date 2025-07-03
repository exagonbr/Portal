import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Obter grupo de estudo por ID
 * GET /api/study-groups/[id]
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do grupo é obrigatório' },
        { status: 400 }
      );
    }

    // Mock de grupo específico
    const mockGroup = {
      id,
      name: 'Grupo de Matemática Avançada',
      description: 'Estudo colaborativo de cálculo diferencial e integral. Focamos em resolver exercícios complexos e discutir conceitos teóricos.',
      courseId: '1',
      courseName: 'Matemática Avançada',
      createdBy: '2',
      createdByName: 'Prof. João Silva',
      status: 'ACTIVE',
      privacy: 'PUBLIC',
      maxMembers: 15,
      currentMembers: 8,
      members: [
        { 
          id: '2', 
          name: 'Prof. João Silva', 
          role: 'OWNER', 
          joinedAt: '2024-12-15T10:00:00Z',
          avatar: '/avatars/prof-joao.jpg',
          status: 'ONLINE'
        },
        { 
          id: '3', 
          name: 'Maria Santos', 
          role: 'MODERATOR', 
          joinedAt: '2025-01-01T10:00:00Z',
          avatar: '/avatars/maria.jpg',
          status: 'OFFLINE'
        },
        { 
          id: '4', 
          name: 'Pedro Costa', 
          role: 'MEMBER', 
          joinedAt: '2025-01-02T14:30:00Z',
          avatar: '/avatars/pedro.jpg',
          status: 'ONLINE'
        },
        { 
          id: '5', 
          name: 'Ana Silva', 
          role: 'MEMBER', 
          joinedAt: '2025-01-03T09:15:00Z',
          avatar: '/avatars/ana.jpg',
          status: 'AWAY'
        }
      ],
      schedule: {
        meetingDay: 'WEDNESDAY',
        meetingTime: '19:00',
        duration: 120,
        location: 'Sala Virtual 1',
        timezone: 'America/Sao_Paulo',
        recurring: true,
        nextMeeting: '2025-01-08T22:00:00Z'
      },
      activities: [
        {
          id: '1',
          type: 'MEETING',
          title: 'Revisão de Limites',
          description: 'Discussão sobre conceitos de limites e continuidade',
          scheduledFor: '2025-01-08T22:00:00Z',
          duration: 120,
          status: 'SCHEDULED'
        },
        {
          id: '2',
          type: 'ASSIGNMENT',
          title: 'Lista de Exercícios 3',
          description: 'Resolver exercícios 15-25 do capítulo 4',
          dueDate: '2025-01-10T23:59:59Z',
          status: 'ACTIVE'
        }
      ],
      resources: [
        {
          id: '1',
          name: 'Notas da Aula - Derivadas',
          type: 'PDF',
          url: '/resources/derivadas-notas.pdf',
          uploadedBy: '2',
          uploadedAt: '2025-01-05T14:30:00Z',
          size: 1024000
        },
        {
          id: '2',
          name: 'Exercícios Resolvidos',
          type: 'PDF',
          url: '/resources/exercicios-resolvidos.pdf',
          uploadedBy: '3',
          uploadedAt: '2025-01-06T16:45:00Z',
          size: 2048000
        }
      ],
      discussions: [
        {
          id: '1',
          title: 'Dúvida sobre regra da cadeia',
          author: 'Pedro Costa',
          authorId: '4',
          createdAt: '2025-01-07T10:30:00Z',
          replies: 3,
          lastReply: '2025-01-07T15:20:00Z'
        },
        {
          id: '2',
          title: 'Material complementar sobre integrais',
          author: 'Maria Santos',
          authorId: '3',
          createdAt: '2025-01-06T20:15:00Z',
          replies: 7,
          lastReply: '2025-01-07T12:45:00Z'
        }
      ],
      tags: ['matemática', 'cálculo', 'estudo-grupo', 'derivadas', 'integrais'],
      settings: {
        allowMemberInvites: true,
        requireApproval: false,
        allowFileSharing: true,
        allowDiscussions: true,
        notificationsEnabled: true
      },
      stats: {
        totalMeetings: 12,
        totalDiscussions: 45,
        totalResources: 23,
        avgAttendance: 85.5,
        memberSatisfaction: 4.7
      },
      createdAt: '2024-12-15T10:00:00Z',
      updatedAt: '2025-01-07T15:30:00Z'
    };

    return NextResponse.json({
      success: true,
      message: 'Grupo de estudo obtido com sucesso',
      data: mockGroup
    });

  } catch (error) {
    console.error('Erro ao obter grupo de estudo:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Atualizar grupo de estudo
 * PUT /api/study-groups/[id]
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    if (!user || !user.permissions.includes('study-groups.edit')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, schedule, privacy, maxMembers, tags } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do grupo é obrigatório' },
        { status: 400 }
      );
    }

    // Mock de atualização
    const updatedGroup = {
      id,
      name: name || 'Grupo Atualizado',
      description: description || 'Descrição atualizada',
      schedule: schedule || {},
      privacy: privacy || 'PUBLIC',
      maxMembers: maxMembers || 15,
      tags: tags || [],
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };

    return NextResponse.json({
      success: true,
      message: 'Grupo de estudo atualizado com sucesso',
      data: updatedGroup
    });

  } catch (error) {
    console.error('Erro ao atualizar grupo de estudo:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Deletar grupo de estudo
 * DELETE /api/study-groups/[id]
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    if (!user || !user.permissions.includes('study-groups.delete')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do grupo é obrigatório' },
        { status: 400 }
      );
    }

    // Mock de deleção
    return NextResponse.json({
      success: true,
      message: 'Grupo de estudo deletado com sucesso',
      data: {
        id,
        deletedAt: new Date().toISOString(),
        deletedBy: user.id
      }
    });

  } catch (error) {
    console.error('Erro ao deletar grupo de estudo:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}