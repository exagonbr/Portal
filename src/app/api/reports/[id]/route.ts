import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Obter relatório por ID
 * GET /api/reports/[id]
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
    if (!user || !user.permissions.includes('reports.view')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do relatório é obrigatório' },
        { status: 400 }
      );
    }

    // Mock de relatório específico
    const mockReport = {
      id,
      title: 'Relatório de Usuários Ativos',
      type: 'USER_ACTIVITY',
      description: 'Análise detalhada de atividade dos usuários no último mês',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      createdBy: user.id,
      createdByName: user.name,
      fileUrl: `/reports/user-activity-${id}.pdf`,
      fileSize: 2048000,
      parameters: {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        includeInactive: false,
        groupBy: 'role'
      },
      data: {
        totalUsers: 1250,
        activeUsers: 987,
        inactiveUsers: 263,
        newUsers: 45,
        byRole: {
          STUDENT: 850,
          TEACHER: 120,
          ADMIN: 15,
          COORDINATOR: 8,
          SYSTEM_ADMIN: 2
        },
        topActivities: [
          { activity: 'Login', count: 5420 },
          { activity: 'View Content', count: 3210 },
          { activity: 'Submit Assignment', count: 1890 },
          { activity: 'Download File', count: 1234 },
          { activity: 'Send Message', count: 987 }
        ]
      },
      metadata: {
        generationTime: '2.3s',
        dataPoints: 15420,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Relatório obtido com sucesso',
      data: mockReport
    });

  } catch (error) {
    console.error('Erro ao obter relatório:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Atualizar relatório
 * PUT /api/reports/[id]
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
    if (!user || !user.permissions.includes('reports.edit')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { title, description, parameters } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do relatório é obrigatório' },
        { status: 400 }
      );
    }

    // Mock de atualização de relatório
    const updatedReport = {
      id,
      title: title || 'Relatório Atualizado',
      description: description || 'Descrição atualizada',
      parameters: parameters || {},
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
      status: 'PENDING_REGENERATION'
    };

    return NextResponse.json({
      success: true,
      message: 'Relatório atualizado com sucesso',
      data: updatedReport
    });

  } catch (error) {
    console.error('Erro ao atualizar relatório:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Deletar relatório
 * DELETE /api/reports/[id]
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
    if (!user || !user.permissions.includes('reports.delete')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do relatório é obrigatório' },
        { status: 400 }
      );
    }

    // Mock de deleção de relatório
    return NextResponse.json({
      success: true,
      message: 'Relatório deletado com sucesso',
      data: {
        id,
        deletedAt: new Date().toISOString(),
        deletedBy: user.id
      }
    });

  } catch (error) {
    console.error('Erro ao deletar relatório:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}