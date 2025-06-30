import { NextRequest, NextResponse } from 'next/server';
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

export const dynamic = 'force-dynamic';

// Função para gerar resumo do dashboard baseado no usuário
function generateDashboardSummary(userRole: string) {
  const now = new Date();
  const hour = now.getHours();
  
  // Simular variação baseada no horário
  const isBusinessHours = hour >= 8 && hour <= 18;
  const baseMultiplier = isBusinessHours ? 1.2 : 0.8;
  
  const baseSummary = {
    timestamp: now.toISOString(),
    user: {
      role: userRole,
      lastAccess: now.toISOString()
    },
    systemStatus: 'operational',
    notifications: {
      unread: Math.floor(Math.random() * 5),
      total: Math.floor(Math.random() * 20) + 10
    }
  };

  // Dados específicos por role
  switch (userRole) {
    case 'SYSTEM_ADMIN':
      return {
        ...baseSummary,
        admin: {
          activeUsers: Math.floor(3240 * baseMultiplier),
          activeSessions: Math.floor(4200 * baseMultiplier),
          systemHealth: 'healthy',
          criticalAlerts: Math.floor(Math.random() * 3),
          pendingTasks: Math.floor(Math.random() * 8),
          serverUptime: 99.97,
          memoryUsage: Math.round((65 + Math.random() * 15) * 100) / 100
        },
        quickStats: {
          totalUsers: 18742,
          totalInstitutions: 24,
          totalSchools: 156,
          systemLoad: Math.round((25 + Math.random() * 35) * 100) / 100
        }
      };

    case 'INSTITUTION_MANAGER':
    case 'INSTITUTION_MANAGER':
      return {
        ...baseSummary,
        institution: {
          totalStudents: Math.floor(1200 * baseMultiplier),
          totalTeachers: Math.floor(85 * baseMultiplier),
          activeClasses: Math.floor(42 * baseMultiplier),
          completionRate: Math.round((75 + Math.random() * 15) * 100) / 100,
          pendingApprovals: Math.floor(Math.random() * 12),
          monthlyGrowth: Math.round((5 + Math.random() * 10) * 100) / 100
        },
        quickStats: {
          newEnrollments: Math.floor(Math.random() * 25) + 10,
          graduations: Math.floor(Math.random() * 15) + 5,
          attendance: Math.round((85 + Math.random() * 10) * 100) / 100
        }
      };

    case 'ACADEMIC_COORDINATOR':
      return {
        ...baseSummary,
        academic: {
          totalCourses: Math.floor(35 * baseMultiplier),
          activeCourses: Math.floor(28 * baseMultiplier),
          studentsEnrolled: Math.floor(450 * baseMultiplier),
          averageGrade: Math.round((7.5 + Math.random() * 1.5) * 100) / 100,
          pendingEvaluations: Math.floor(Math.random() * 15),
          courseCompletionRate: Math.round((78 + Math.random() * 12) * 100) / 100
        },
        quickStats: {
          newAssignments: Math.floor(Math.random() * 8) + 2,
          gradedAssignments: Math.floor(Math.random() * 20) + 10,
          teacherPerformance: Math.round((85 + Math.random() * 10) * 100) / 100
        }
      };

    case 'TEACHER':
      return {
        ...baseSummary,
        teaching: {
          totalClasses: Math.floor(6 * baseMultiplier),
          activeStudents: Math.floor(120 * baseMultiplier),
          pendingGrades: Math.floor(Math.random() * 25),
          averageAttendance: Math.round((88 + Math.random() * 8) * 100) / 100,
          assignmentsToReview: Math.floor(Math.random() * 18),
          studentProgress: Math.round((82 + Math.random() * 12) * 100) / 100
        },
        quickStats: {
          todayClasses: Math.floor(Math.random() * 4) + 1,
          upcomingDeadlines: Math.floor(Math.random() * 6) + 2,
          studentQuestions: Math.floor(Math.random() * 8)
        }
      };

    case 'STUDENT':
      return {
        ...baseSummary,
        student: {
          enrolledCourses: Math.floor(5 * baseMultiplier),
          completedAssignments: Math.floor(12 * baseMultiplier),
          pendingAssignments: Math.floor(Math.random() * 8) + 2,
          averageGrade: Math.round((7.8 + Math.random() * 1.5) * 100) / 100,
          attendanceRate: Math.round((92 + Math.random() * 6) * 100) / 100,
          studyHours: Math.floor(Math.random() * 20) + 15
        },
        quickStats: {
          todayClasses: Math.floor(Math.random() * 3) + 1,
          upcomingExams: Math.floor(Math.random() * 4) + 1,
          unreadMessages: Math.floor(Math.random() * 5)
        }
      };

    case 'GUARDIAN':
      return {
        ...baseSummary,
        guardian: {
          children: Math.floor(Math.random() * 3) + 1,
          totalGrades: Math.floor(Math.random() * 15) + 10,
          attendanceAlerts: Math.floor(Math.random() * 3),
          averagePerformance: Math.round((8.2 + Math.random() * 1.0) * 100) / 100,
          upcomingEvents: Math.floor(Math.random() * 5) + 2,
          communicationsPending: Math.floor(Math.random() * 4)
        },
        quickStats: {
          recentGrades: Math.floor(Math.random() * 8) + 3,
          schoolEvents: Math.floor(Math.random() * 6) + 2,
          parentMeetings: Math.floor(Math.random() * 2) + 1
        }
      };

    default:
      return baseSummary;
  }
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

    const userRole = session.user.role;
    const summary = generateDashboardSummary(userRole);

    return NextResponse.json({
      success: true,
      data: summary
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao buscar resumo do dashboard:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
