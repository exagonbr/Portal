import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Obter relatórios
 * GET /api/reports
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
    if (!user || !user.permissions.includes('reports.view')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Mock de relatórios
    const mockReports = [
      {
        id: '1',
        title: 'Relatório de Usuários Ativos',
        type: 'USER_ACTIVITY',
        description: 'Análise de atividade dos usuários no último mês',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        createdBy: user.id,
        fileUrl: '/reports/user-activity-2025-01.pdf',
        fileSize: 2048000
      },
      {
        id: '2',
        title: 'Relatório de Performance do Sistema',
        type: 'SYSTEM_PERFORMANCE',
        description: 'Métricas de performance e disponibilidade',
        status: 'PROCESSING',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        createdBy: user.id,
        fileUrl: null,
        fileSize: null,
        progress: 75
      },
      {
        id: '3',
        title: 'Relatório de Segurança',
        type: 'SECURITY',
        description: 'Análise de tentativas de login e atividades suspeitas',
        status: 'FAILED',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        createdBy: user.id,
        fileUrl: null,
        fileSize: null,
        error: 'Falha ao acessar logs de segurança'
      }
    ];

    let filteredReports = mockReports;
    if (type) {
      filteredReports = filteredReports.filter(report => report.type === type);
    }

    const paginatedReports = filteredReports.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      message: 'Relatórios obtidos com sucesso',
      data: {
        reports: paginatedReports,
        pagination: {
          total: filteredReports.length,
          limit,
          offset,
          hasMore: offset + limit < filteredReports.length
        },
        summary: {
          total: mockReports.length,
          completed: mockReports.filter(r => r.status === 'COMPLETED').length,
          processing: mockReports.filter(r => r.status === 'PROCESSING').length,
          failed: mockReports.filter(r => r.status === 'FAILED').length
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter relatórios:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Criar novo relatório
 * POST /api/reports
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
    if (!user || !user.permissions.includes('reports.create')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, type, description, parameters } = body;

    if (!title || !type) {
      return NextResponse.json(
        { success: false, message: 'Título e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    // Mock de criação de relatório
    const newReport = {
      id: Date.now().toString(),
      title,
      type,
      description: description || '',
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
      completedAt: null,
      createdBy: user.id,
      fileUrl: null,
      fileSize: null,
      parameters: parameters || {},
      progress: 0
    };

    return NextResponse.json({
      success: true,
      message: 'Relatório criado com sucesso',
      data: newReport
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar relatório:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
