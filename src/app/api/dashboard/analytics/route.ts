export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils';

// Função para gerar dados analíticos baseados no horário
function generateAnalyticsData() {
  const now = new Date();
  const hour = now.getHours();
  
  // Simular variação baseada no horário (horário comercial tem mais atividade)
  const isBusinessHours = hour >= 8 && hour <= 18;
  const baseMultiplier = isBusinessHours ? 1.5 : 0.7;
  
  return {
    overview: {
      totalUsers: Math.floor(15420 * baseMultiplier),
      activeUsers: Math.floor(3240 * baseMultiplier),
      totalSessions: Math.floor(8760 * baseMultiplier),
      avgSessionDuration: Math.floor(1800 + (Math.random() * 600)), // 30-40 min
      bounceRate: Math.round((25 + Math.random() * 10) * 100) / 100, // 25-35%
      conversionRate: Math.round((12 + Math.random() * 8) * 100) / 100 // 12-20%
    },
    userActivity: {
      dailyActiveUsers: Math.floor(2100 * baseMultiplier),
      weeklyActiveUsers: Math.floor(8500 * baseMultiplier),
      monthlyActiveUsers: Math.floor(12300 * baseMultiplier),
      newUsers: Math.floor(145 * baseMultiplier),
      returningUsers: Math.floor(1955 * baseMultiplier)
    },
    contentEngagement: {
      totalPageViews: Math.floor(45600 * baseMultiplier),
      uniquePageViews: Math.floor(32100 * baseMultiplier),
      avgTimeOnPage: Math.floor(180 + (Math.random() * 120)), // 3-5 min
      exitRate: Math.round((15 + Math.random() * 10) * 100) / 100, // 15-25%
      topPages: [
        { page: '/dashboard', views: Math.floor(8900 * baseMultiplier), avgTime: 245 },
        { page: '/courses', views: Math.floor(6700 * baseMultiplier), avgTime: 320 },
        { page: '/library', views: Math.floor(5400 * baseMultiplier), avgTime: 180 },
        { page: '/assignments', views: Math.floor(4200 * baseMultiplier), avgTime: 290 },
        { page: '/profile', views: Math.floor(3100 * baseMultiplier), avgTime: 150 }
      ]
    },
    deviceAnalytics: {
      desktop: Math.round(65 + Math.random() * 10), // 65-75%
      mobile: Math.round(20 + Math.random() * 10), // 20-30%
      tablet: Math.round(5 + Math.random() * 5), // 5-10%
      browsers: {
        chrome: Math.round(45 + Math.random() * 15), // 45-60%
        firefox: Math.round(15 + Math.random() * 10), // 15-25%
        safari: Math.round(10 + Math.random() * 10), // 10-20%
        edge: Math.round(8 + Math.random() * 7), // 8-15%
        other: Math.round(2 + Math.random() * 3) // 2-5%
      }
    },
    geographicData: {
      countries: [
        { country: 'Brasil', users: Math.floor(12500 * baseMultiplier), percentage: 81 },
        { country: 'Argentina', users: Math.floor(1200 * baseMultiplier), percentage: 8 },
        { country: 'Chile', users: Math.floor(800 * baseMultiplier), percentage: 5 },
        { country: 'Uruguai', users: Math.floor(400 * baseMultiplier), percentage: 3 },
        { country: 'Outros', users: Math.floor(520 * baseMultiplier), percentage: 3 }
      ],
      regions: [
        { region: 'Sudeste', users: Math.floor(7800 * baseMultiplier), percentage: 51 },
        { region: 'Sul', users: Math.floor(2400 * baseMultiplier), percentage: 16 },
        { region: 'Nordeste', users: Math.floor(2100 * baseMultiplier), percentage: 14 },
        { region: 'Centro-Oeste', users: Math.floor(1500 * baseMultiplier), percentage: 10 },
        { region: 'Norte', users: Math.floor(1320 * baseMultiplier), percentage: 9 }
      ]
    },
    performanceMetrics: {
      avgLoadTime: Math.round((1.2 + Math.random() * 0.8) * 100) / 100, // 1.2-2.0s
      serverResponseTime: Math.round((200 + Math.random() * 100) * 100) / 100, // 200-300ms
      errorRate: Math.round((0.5 + Math.random() * 1.5) * 100) / 100, // 0.5-2.0%
      uptime: Math.round((99.5 + Math.random() * 0.4) * 100) / 100 // 99.5-99.9%
    },
    trends: {
      last7Days: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        users: Math.floor((1800 + Math.random() * 600) * baseMultiplier),
        sessions: Math.floor((2400 + Math.random() * 800) * baseMultiplier),
        pageViews: Math.floor((5200 + Math.random() * 1500) * baseMultiplier)
      })),
      last30Days: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        users: Math.floor((1600 + Math.random() * 800) * baseMultiplier),
        sessions: Math.floor((2200 + Math.random() * 1000) * baseMultiplier),
        pageViews: Math.floor((4800 + Math.random() * 2000) * baseMultiplier)
      }))
    },
    realTimeData: {
      currentActiveUsers: Math.floor(245 * baseMultiplier),
      currentSessions: Math.floor(189 * baseMultiplier),
      pagesPerSession: Math.round((3.2 + Math.random() * 1.8) * 100) / 100, // 3.2-5.0
      topActivePages: [
        { page: '/dashboard', activeUsers: Math.floor(45 * baseMultiplier) },
        { page: '/courses', activeUsers: Math.floor(32 * baseMultiplier) },
        { page: '/library', activeUsers: Math.floor(28 * baseMultiplier) },
        { page: '/assignments', activeUsers: Math.floor(21 * baseMultiplier) },
        { page: '/forum', activeUsers: Math.floor(18 * baseMultiplier) }
      ]
    },
    lastUpdated: now.toISOString()
  };
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verificar se tem permissão para ver analytics
    if (!hasRequiredRole(session.user.role, ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'ACADEMIC_COORDINATOR'])) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const analyticsData = generateAnalyticsData();

    return NextResponse.json({
      success: true,
      data: analyticsData
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao buscar analytics do dashboard:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 