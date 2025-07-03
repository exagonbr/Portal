import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, MOCK_USERS } from '@/middleware/auth';

/**
 * Obter relatórios de uso
 * GET /api/reports/usage
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
    const period = url.searchParams.get('period') || 'month';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Mock de dados de uso
    const usageData = {
      period,
      dateRange: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: endDate || new Date().toISOString()
      },
      summary: {
        totalUsers: 1250,
        activeUsers: 987,
        totalSessions: 15420,
        avgSessionDuration: '24m 35s',
        totalPageViews: 89340,
        uniquePageViews: 45670,
        bounceRate: '23.4%'
      },
      userActivity: {
        daily: [
          { date: '2025-01-01', users: 234, sessions: 456, pageViews: 1234 },
          { date: '2025-01-02', users: 267, sessions: 523, pageViews: 1456 },
          { date: '2025-01-03', users: 298, sessions: 612, pageViews: 1678 },
          { date: '2025-01-04', users: 245, sessions: 489, pageViews: 1345 },
          { date: '2025-01-05', users: 312, sessions: 634, pageViews: 1789 },
          { date: '2025-01-06', users: 289, sessions: 578, pageViews: 1567 },
          { date: '2025-01-07', users: 276, sessions: 545, pageViews: 1432 }
        ],
        hourly: [
          { hour: 0, users: 12, sessions: 15 },
          { hour: 1, users: 8, sessions: 10 },
          { hour: 2, users: 5, sessions: 6 },
          { hour: 3, users: 3, sessions: 4 },
          { hour: 4, users: 7, sessions: 9 },
          { hour: 5, users: 15, sessions: 18 },
          { hour: 6, users: 25, sessions: 32 },
          { hour: 7, users: 45, sessions: 58 },
          { hour: 8, users: 78, sessions: 95 },
          { hour: 9, users: 125, sessions: 156 },
          { hour: 10, users: 145, sessions: 178 },
          { hour: 11, users: 156, sessions: 189 },
          { hour: 12, users: 134, sessions: 167 },
          { hour: 13, users: 167, sessions: 203 },
          { hour: 14, users: 189, sessions: 234 },
          { hour: 15, users: 178, sessions: 221 },
          { hour: 16, users: 156, sessions: 195 },
          { hour: 17, users: 134, sessions: 168 },
          { hour: 18, users: 112, sessions: 140 },
          { hour: 19, users: 89, sessions: 112 },
          { hour: 20, users: 67, sessions: 84 },
          { hour: 21, users: 45, sessions: 56 },
          { hour: 22, users: 32, sessions: 40 },
          { hour: 23, users: 18, sessions: 23 }
        ]
      },
      topPages: [
        { path: '/dashboard', views: 12340, uniqueViews: 8920, avgTime: '3m 45s' },
        { path: '/courses', views: 9870, uniqueViews: 7650, avgTime: '2m 30s' },
        { path: '/assignments', views: 7650, uniqueViews: 6120, avgTime: '4m 15s' },
        { path: '/profile', views: 5430, uniqueViews: 4890, avgTime: '1m 50s' },
        { path: '/messages', views: 4320, uniqueViews: 3780, avgTime: '2m 10s' }
      ],
      devices: {
        desktop: { count: 8920, percentage: 67.2 },
        mobile: { count: 3450, percentage: 26.0 },
        tablet: { count: 890, percentage: 6.8 }
      },
      browsers: {
        chrome: { count: 7890, percentage: 59.4 },
        firefox: { count: 2340, percentage: 17.6 },
        safari: { count: 1890, percentage: 14.2 },
        edge: { count: 890, percentage: 6.7 },
        other: { count: 270, percentage: 2.1 }
      },
      operatingSystems: {
        windows: { count: 6780, percentage: 51.0 },
        macos: { count: 3450, percentage: 26.0 },
        linux: { count: 1890, percentage: 14.2 },
        android: { count: 890, percentage: 6.7 },
        ios: { count: 270, percentage: 2.1 }
      },
      features: {
        mostUsed: [
          { feature: 'Dashboard', usage: 95.6 },
          { feature: 'Course Viewer', usage: 87.3 },
          { feature: 'Assignment Submission', usage: 76.8 },
          { feature: 'File Download', usage: 65.4 },
          { feature: 'Messaging', usage: 54.2 }
        ],
        leastUsed: [
          { feature: 'Advanced Search', usage: 12.3 },
          { feature: 'Calendar Integration', usage: 18.7 },
          { feature: 'Report Generation', usage: 23.4 },
          { feature: 'Bulk Operations', usage: 31.2 },
          { feature: 'API Access', usage: 8.9 }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Relatório de uso obtido com sucesso',
      data: usageData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao obter relatório de uso:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Gerar novo relatório de uso
 * POST /api/reports/usage
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
    const { period, startDate, endDate, includeDetails } = body;

    // Mock de geração de relatório
    const reportJob = {
      id: Date.now().toString(),
      type: 'USAGE_REPORT',
      status: 'PROCESSING',
      parameters: {
        period: period || 'month',
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate || new Date().toISOString(),
        includeDetails: includeDetails || false
      },
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      progress: 0
    };

    return NextResponse.json({
      success: true,
      message: 'Relatório de uso iniciado com sucesso',
      data: reportJob
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao gerar relatório de uso:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
