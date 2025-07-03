import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth-middleware';

// Função para gerar dados de engajamento baseados no horário
function generateEngagementData() {
  const now = new Date();
  const hour = now.getHours();
  
  // Simular variação baseada no horário
  const isBusinessHours = hour >= 8 && hour <= 18;
  const isPeakHours = hour >= 10 && hour <= 16;
  const baseMultiplier = isPeakHours ? 1.8 : isBusinessHours ? 1.3 : 0.6;
  
  return {
    overview: {
      totalEngagementScore: Math.round((75 + Math.random() * 20) * 100) / 100, // 75-95
      dailyActiveUsers: Math.floor(2850 * baseMultiplier),
      weeklyActiveUsers: Math.floor(8200 * baseMultiplier),
      monthlyActiveUsers: Math.floor(15600 * baseMultiplier),
      averageSessionTime: Math.floor(1680 + (Math.random() * 840)), // 28-42 min
      returnUserRate: Math.round((68 + Math.random() * 15) * 100) / 100 // 68-83%
    },
    userBehavior: {
      pagesPerSession: Math.round((4.2 + Math.random() * 2.3) * 100) / 100, // 4.2-6.5
      bounceRate: Math.round((18 + Math.random() * 12) * 100) / 100, // 18-30%
      timeOnSite: Math.floor(1200 + (Math.random() * 900)), // 20-35 min
      interactionRate: Math.round((45 + Math.random() * 25) * 100) / 100, // 45-70%
      conversionRate: Math.round((8 + Math.random() * 12) * 100) / 100 // 8-20%
    },
    contentEngagement: {
      mostViewedContent: [
        { 
          title: 'Matemática Básica - Módulo 1', 
          views: Math.floor(3420 * baseMultiplier), 
          avgTime: 1260,
          completionRate: 78.5
        },
        { 
          title: 'História do Brasil - Período Colonial', 
          views: Math.floor(2890 * baseMultiplier), 
          avgTime: 1580,
          completionRate: 82.1
        },
        { 
          title: 'Física - Mecânica Clássica', 
          views: Math.floor(2650 * baseMultiplier), 
          avgTime: 1420,
          completionRate: 71.3
        },
        { 
          title: 'Literatura Brasileira - Romantismo', 
          views: Math.floor(2340 * baseMultiplier), 
          avgTime: 1680,
          completionRate: 85.7
        },
        { 
          title: 'Química Orgânica - Introdução', 
          views: Math.floor(2120 * baseMultiplier), 
          avgTime: 1380,
          completionRate: 69.2
        }
      ],
      topFeatures: [
        { name: 'Biblioteca Digital', usage: Math.round(85 + Math.random() * 10), growth: 12.5 },
        { name: 'Fórum de Discussão', usage: Math.round(72 + Math.random() * 15), growth: 8.3 },
        { name: 'Exercícios Interativos', usage: Math.round(68 + Math.random() * 18), growth: 15.7 },
        { name: 'Videoaulas', usage: Math.round(78 + Math.random() * 12), growth: 22.1 },
        { name: 'Quiz e Avaliações', usage: Math.round(65 + Math.random() * 20), growth: 9.8 },
        { name: 'Grupos de Estudo', usage: Math.round(45 + Math.random() * 25), growth: 18.4 },
        { name: 'Calendário Acadêmico', usage: Math.round(58 + Math.random() * 22), growth: 6.2 },
        { name: 'Relatórios de Progresso', usage: Math.round(52 + Math.random() * 28), growth: 11.9 }
      ]
    },
    socialEngagement: {
      forumPosts: Math.floor(450 * baseMultiplier),
      forumReplies: Math.floor(1280 * baseMultiplier),
      studyGroupsActive: Math.floor(85 * baseMultiplier),
      collaborativeProjects: Math.floor(32 * baseMultiplier),
      peerReviews: Math.floor(156 * baseMultiplier),
      sharedResources: Math.floor(89 * baseMultiplier)
    },
    learningProgress: {
      coursesStarted: Math.floor(1240 * baseMultiplier),
      coursesCompleted: Math.floor(380 * baseMultiplier),
      averageProgress: Math.round((65 + Math.random() * 20) * 100) / 100, // 65-85%
      certificatesEarned: Math.floor(290 * baseMultiplier),
      skillsAcquired: Math.floor(1850 * baseMultiplier),
      badgesEarned: Math.floor(520 * baseMultiplier)
    },
    timeBasedMetrics: {
      peakHours: [
        { hour: '09:00', users: Math.floor(420 * baseMultiplier) },
        { hour: '10:00', users: Math.floor(580 * baseMultiplier) },
        { hour: '11:00', users: Math.floor(650 * baseMultiplier) },
        { hour: '14:00', users: Math.floor(720 * baseMultiplier) },
        { hour: '15:00', users: Math.floor(680 * baseMultiplier) },
        { hour: '16:00', users: Math.floor(590 * baseMultiplier) },
        { hour: '19:00', users: Math.floor(480 * baseMultiplier) },
        { hour: '20:00', users: Math.floor(520 * baseMultiplier) }
      ],
      weeklyPattern: [
        { day: 'Segunda', engagement: Math.round(78 + Math.random() * 15) },
        { day: 'Terça', engagement: Math.round(82 + Math.random() * 12) },
        { day: 'Quarta', engagement: Math.round(85 + Math.random() * 10) },
        { day: 'Quinta', engagement: Math.round(80 + Math.random() * 15) },
        { day: 'Sexta', engagement: Math.round(75 + Math.random() * 18) },
        { day: 'Sábado', engagement: Math.round(45 + Math.random() * 25) },
        { day: 'Domingo', engagement: Math.round(35 + Math.random() * 20) }
      ]
    },
    deviceEngagement: {
      desktop: {
        users: Math.floor(1850 * baseMultiplier),
        avgSessionTime: 2100,
        pagesPerSession: 5.8,
        bounceRate: 15.2
      },
      mobile: {
        users: Math.floor(980 * baseMultiplier),
        avgSessionTime: 1200,
        pagesPerSession: 3.4,
        bounceRate: 28.7
      },
      tablet: {
        users: Math.floor(320 * baseMultiplier),
        avgSessionTime: 1680,
        pagesPerSession: 4.6,
        bounceRate: 22.1
      }
    },
    trends: {
      last7Days: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        engagementScore: Math.round((70 + Math.random() * 25) * 100) / 100,
        activeUsers: Math.floor((2200 + Math.random() * 800) * baseMultiplier),
        sessionDuration: Math.floor(1500 + Math.random() * 600),
        interactionRate: Math.round((40 + Math.random() * 30) * 100) / 100
      })),
      last30Days: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        engagementScore: Math.round((65 + Math.random() * 30) * 100) / 100,
        activeUsers: Math.floor((2000 + Math.random() * 1000) * baseMultiplier),
        sessionDuration: Math.floor(1400 + Math.random() * 700),
        interactionRate: Math.round((35 + Math.random() * 35) * 100) / 100
      }))
    },
    alerts: [
      {
        type: 'positive',
        message: 'Engajamento em videoaulas aumentou 22% esta semana',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'info',
        message: 'Novo pico de usuários simultâneos: 720 usuários às 14h',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'warning',
        message: 'Taxa de abandono em mobile aumentou para 28.7%',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ],
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
    console.log('🚀 [/api/dashboard/engagement] Iniciando requisição (ROTA PÚBLICA)...');
    
    // Retornar dados de fallback diretamente (rota pública)
    const fallbackData = {
      daily_active_users: 2456,
      weekly_active_users: 8934,
      monthly_active_users: 15678,
      average_session_time: 1847, // em segundos
      user_retention: {
        day_1: 78.5,
        day_7: 45.2,
        day_30: 23.8
      },
      engagement_metrics: {
        posts_created: 5678,
        comments_made: 12345,
        likes_given: 23456,
        shares_made: 3456,
        files_uploaded: 1234
      },
      activity_by_hour: [
        { hour: 0, activity: 234 },
        { hour: 1, activity: 156 },
        { hour: 2, activity: 89 },
        { hour: 3, activity: 67 },
        { hour: 4, activity: 45 },
        { hour: 5, activity: 78 },
        { hour: 6, activity: 234 },
        { hour: 7, activity: 456 },
        { hour: 8, activity: 789 },
        { hour: 9, activity: 1234 },
        { hour: 10, activity: 1456 },
        { hour: 11, activity: 1678 },
        { hour: 12, activity: 1789 },
        { hour: 13, activity: 1654 },
        { hour: 14, activity: 1567 },
        { hour: 15, activity: 1345 },
        { hour: 16, activity: 1123 },
        { hour: 17, activity: 987 },
        { hour: 18, activity: 765 },
        { hour: 19, activity: 543 },
        { hour: 20, activity: 432 },
        { hour: 21, activity: 321 },
        { hour: 22, activity: 234 },
        { hour: 23, activity: 178 }
      ],
      top_features: [
        { feature: 'Dashboard', usage: 89.5 },
        { feature: 'Courses', usage: 76.3 },
        { feature: 'Assignments', usage: 65.7 },
        { feature: 'Chat', usage: 54.2 },
        { feature: 'Calendar', usage: 43.8 }
      ]
    };

    console.log('✅ [/api/dashboard/engagement] Retornando dados de fallback (rota pública)');
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    console.log('📊 [/api/dashboard/engagement] Buscando métricas de engajamento...');
    
    const engagementData = generateEngagementData();

    return NextResponse.json({
      success: true,
      data: fallbackData,
      message: 'Métricas de engajamento (rota pública - dados de fallback)'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.log('❌ [/api/dashboard/engagement] Erro ao buscar métricas de engajamento:', error);
    
    console.log('❌ [/api/dashboard/engagement] Erro ao buscar métricas de engajamento:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}, {
  requiredRoles: ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'ACADEMIC_COORDINATOR']
});
