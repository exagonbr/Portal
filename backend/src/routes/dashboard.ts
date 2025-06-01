/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: 📊 Dashboard, analytics e métricas do sistema
 */

import express from 'express';
import { query, validationResult } from 'express-validator';
import { DashboardService } from '../services/DashboardService';
import { 
  validateJWTAndSession, 
  AuthenticatedRequest,
  requireRole 
} from '../middleware/sessionMiddleware';
import db from '../config/database';

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/system:
 *   get:
 *     summary: Dashboard do sistema (Admin)
 *     description: Retorna estatísticas completas do sistema incluindo usuários, sessões, performance e atividades recentes
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard do sistema retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 dashboard:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/system', 
  validateJWTAndSession, 
  requireRole(['admin', 'SYSTEM_ADMIN']), 
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const dashboardData = await DashboardService.getSystemDashboard();

      return res.json({
        success: true,
        data: dashboardData
      });
    } catch (error: any) {
      console.error('Erro ao obter dashboard do sistema:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/user:
 *   get:
 *     summary: Dashboard do usuário
 *     description: Retorna dashboard personalizado para o usuário atual com suas estatísticas, cursos e atividades
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard do usuário retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 dashboard:
 *                   $ref: '#/components/schemas/UserDashboard'
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/user', validateJWTAndSession, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.userId;
    const dashboardData = await DashboardService.getUserDashboard(userId);

    return res.json({
      success: true,
      data: dashboardData
    });
  } catch (error: any) {
    console.error('Erro ao obter dashboard do usuário:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/metrics/realtime:
 *   get:
 *     summary: Métricas em tempo real
 *     description: Retorna métricas do sistema em tempo real como usuários ativos, memória Redis, etc.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas em tempo real retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 metrics:
 *                   $ref: '#/components/schemas/RealTimeMetrics'
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/metrics/realtime', 
  validateJWTAndSession, 
  requireRole(['admin', 'SYSTEM_ADMIN']), 
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const metrics = await DashboardService.getRealTimeMetrics();

      return res.json({
        success: true,
        data: metrics
      });
    } catch (error: any) {
      console.error('Erro ao obter métricas em tempo real:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/analytics:
 *   get:
 *     summary: Dados de analytics
 *     description: Retorna dados analíticos do sistema para geração de gráficos e relatórios
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         description: Tipo de analytics desejado
 *         schema:
 *           type: string
 *           enum: [users, sessions, activity]
 *           example: users
 *       - in: query
 *         name: period
 *         required: false
 *         description: Período para análise
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *           example: week
 *     responses:
 *       200:
 *         description: Dados de analytics retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analytics:
 *                   $ref: '#/components/schemas/AnalyticsData'
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/analytics', 
  validateJWTAndSession, 
  requireRole(['admin', 'SYSTEM_ADMIN']),
  [
    query('type').isIn(['users', 'sessions', 'activity']).withMessage('Tipo deve ser users, sessions ou activity'),
    query('period').optional().isIn(['day', 'week', 'month']).withMessage('Período deve ser day, week ou month')
  ],
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { type, period = 'week' } = req.query as { type: 'users' | 'sessions' | 'activity', period?: 'day' | 'week' | 'month' };
      
      const analyticsData = await DashboardService.getAnalyticsData(type, period);

      return res.json({
        success: true,
        data: analyticsData
      });
    } catch (error: any) {
      console.error('Erro ao obter dados de analytics:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Resumo do dashboard
 *     description: Retorna um resumo personalizado baseado no role do usuário
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumo retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 summary:
 *                   type: object
 *                   description: Resumo personalizado baseado no role do usuário
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/summary', validateJWTAndSession, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Métricas básicas para todos os usuários
    let summary: any = {
      user: {
        id: userId,
        role: userRole,
        lastAccess: new Date()
      }
    };

    // Adiciona métricas específicas para admins
    if (userRole === 'admin' || userRole === 'SYSTEM_ADMIN') {
      const realTimeMetrics = await DashboardService.getRealTimeMetrics();
      summary.admin = {
        activeUsers: realTimeMetrics.activeUsers,
        activeSessions: realTimeMetrics.activeSessions,
        systemHealth: 'healthy'
      };
    }

    // Adiciona dados personalizados para o usuário
    const userDashboard = await DashboardService.getUserDashboard(userId);
    summary.personalStats = userDashboard.user.stats;

    return res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    console.error('Erro ao obter resumo do dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/notifications:
 *   get:
 *     summary: Notificações do dashboard
 *     description: Retorna notificações relevantes para o dashboard do usuário
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificações retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "notif_123"
 *                       type:
 *                         type: string
 *                         enum: [info, warning, success, error]
 *                         example: "info"
 *                       title:
 *                         type: string
 *                         example: "Nova funcionalidade disponível"
 *                       message:
 *                         type: string
 *                         example: "O sistema de sessões foi atualizado"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       read:
 *                         type: boolean
 *                         example: false
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/notifications', validateJWTAndSession, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Implementação simulada de notificações
    const notifications = [
      {
        id: '1',
        type: 'info',
        title: 'Bem-vindo ao Portal Sabercon',
        message: 'Explore todas as funcionalidades disponíveis.',
        timestamp: new Date(),
        read: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Sessão expirando',
        message: 'Sua sessão expirará em breve. Salve seu trabalho.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
        read: false
      }
    ];

    return res.json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    console.error('Erro ao obter notificações:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/health:
 *   get:
 *     summary: Status de saúde do sistema
 *     description: Retorna o status de saúde dos componentes do sistema (API, banco de dados, Redis)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status de saúde retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 health:
 *                   $ref: '#/components/schemas/SystemHealth'
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/health', 
  validateJWTAndSession, 
  requireRole(['admin', 'SYSTEM_ADMIN']), 
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      // Verifica saúde dos componentes
      const realTimeMetrics = await DashboardService.getRealTimeMetrics();
      
      const healthStatus = {
        overall: 'healthy',
        components: {
          api: {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage()
          },
          redis: {
            status: 'healthy',
            activeConnections: realTimeMetrics.activeSessions,
            memory: realTimeMetrics.redisMemory
          },
          database: {
            status: 'healthy', // Em produção, você faria uma query de teste
            connections: 'active'
          }
        },
        timestamp: new Date().toISOString()
      };

      return res.json({
        success: true,
        data: healthStatus
      });
    } catch (error: any) {
      console.error('Erro ao verificar saúde do sistema:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/teacher:
 *   get:
 *     summary: Get teacher dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher dashboard data
 */
router.get('/teacher', validateJWTAndSession, requireRole(['teacher']), async (req, res) => {
  try {
    const userId = req.user?.userId;

    // Buscar cursos do professor
    const courses = await db('courses')
      .where('teacher_id', userId)
      .where('status', '!=', 'archived');

    // Estatísticas básicas
    const totalCourses = courses.length;
    const activeCourses = courses.filter(course => course.status === 'published').length;

    // Buscar estudantes únicos nos cursos (simulado - precisaria de tabela de matrículas)
    const totalStudents = 0; // Seria calculado com base nas matrículas

    // Buscar atividades recentes
    const recentActivities = await db('content')
      .join('modules', 'content.module_id', 'modules.id')
      .join('courses', 'modules.course_id', 'courses.id')
      .select([
        'content.id',
        'content.title',
        'content.type',
        'content.created_at',
        'courses.title as course_title'
      ])
      .where('courses.teacher_id', userId)
      .orderBy('content.created_at', 'desc')
      .limit(10);

    // Próximas aulas (simulado)
    const upcomingClasses: any[] = []; // Seria baseado em um sistema de agendamento

    const dashboardData = {
      totalStudents,
      totalCourses,
      activeCourses,
      averageAttendance: 0, // Seria calculado com base nos dados de presença
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        status: course.status,
        students_count: 0, // Seria calculado
        created_at: course.created_at
      })),
      recentActivities,
      upcomingClasses,
      performance: {
        coursesCreated: totalCourses,
        contentCreated: recentActivities.length,
        studentsEngaged: totalStudents
      }
    };

    return res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/student:
 *   get:
 *     summary: Get student dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard data
 */
router.get('/student', validateJWTAndSession, requireRole(['student']), async (req, res) => {
  try {
    // Buscar cursos em que o estudante está matriculado (simulado)
    const enrolledCourses = await db('courses')
      .join('users as teachers', 'courses.teacher_id', 'teachers.id')
      .select([
        'courses.*',
        'teachers.name as teacher_name'
      ])
      .where('courses.status', 'published')
      .limit(10); // Simulado - seria baseado em matrículas

    // Progresso dos cursos (simulado)
    const courseProgress = enrolledCourses.map(course => ({
      course_id: course.id,
      course_title: course.title,
      progress: Math.floor(Math.random() * 100), // Simulado
      completed_modules: Math.floor(Math.random() * 10),
      total_modules: Math.floor(Math.random() * 15) + 10
    }));

    // Atividades pendentes (simulado)
    const pendingActivities = await db('content')
      .join('modules', 'content.module_id', 'modules.id')
      .join('courses', 'modules.course_id', 'courses.id')
      .select([
        'content.id',
        'content.title',
        'content.type',
        'courses.title as course_title',
        'content.created_at'
      ])
      .where('content.type', 'assignment')
      .orderBy('content.created_at', 'desc')
      .limit(5);

    // Livros recentes
    const recentBooks = await db('books')
      .where('status', 'available')
      .orderBy('created_at', 'desc')
      .limit(5);

    // Vídeos recentes
    const recentVideos = await db('content')
      .where('type', 'video')
      .where('status', 'active')
      .orderBy('created_at', 'desc')
      .limit(5);

    const dashboardData = {
      enrolledCourses: enrolledCourses.length,
      completedAssignments: 0, // Seria calculado
      averageGrade: 0, // Seria calculado
      attendanceRate: 0, // Seria calculado
      courseProgress,
      pendingActivities,
      recentBooks,
      recentVideos,
      achievements: [], // Sistema de conquistas
      upcomingDeadlines: [] // Prazos próximos
    };

    return res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 */
router.get('/admin', validateJWTAndSession, requireRole(['admin']), async (req, res) => {
  try {
    const institutionId = req.user?.institutionId;

    // Estatísticas gerais
    let userQuery = db('users').where('is_active', true);
    let courseQuery = db('courses').where('status', '!=', 'archived');
    let bookQuery = db('books').where('status', 'available');

    // Filtrar por instituição se não for super admin
    if (institutionId) {
      userQuery = userQuery.where('institution_id', institutionId);
      courseQuery = courseQuery.where('institution_id', institutionId);
      bookQuery = bookQuery.where('institution_id', institutionId);
    }

    const [
      totalUsers,
      totalCourses,
      totalBooks,
      totalInstitutions
    ] = await Promise.all([
      userQuery.count('* as count').first().then(result => Number(result?.count) || 0),
      courseQuery.count('* as count').first().then(result => Number(result?.count) || 0),
      bookQuery.count('* as count').first().then(result => Number(result?.count) || 0),
      institutionId ? 1 : db('institutions').where('status', 'active').count('* as count').first().then(result => Number(result?.count) || 0)
    ]);

    // Distribuição de usuários por role
    const usersByRole = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select('roles.name as role_name')
      .count('users.id as count')
      .where('users.is_active', true)
      .modify(query => {
        if (institutionId) {
          query.where('users.institution_id', institutionId);
        }
      })
      .groupBy('roles.name');

    // Cursos mais populares (simulado)
    const popularCourses = await courseQuery
      .select(['id', 'title', 'created_at'])
      .orderBy('created_at', 'desc')
      .limit(5);

    // Atividade recente
    const recentActivity = await db('users')
      .select(['name', 'email', 'created_at'])
      .where('is_active', true)
      .modify(query => {
        if (institutionId) {
          query.where('institution_id', institutionId);
        }
      })
      .orderBy('created_at', 'desc')
      .limit(10);

    const dashboardData = {
      overview: {
        totalUsers,
        totalCourses,
        totalBooks,
        totalInstitutions
      },
      usersByRole,
      popularCourses,
      recentActivity,
      systemHealth: {
        database: 'online',
        redis: 'online',
        storage: 'online'
      }
    };

    return res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/coordinator:
 *   get:
 *     summary: Get coordinator dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coordinator dashboard data
 */
router.get('/coordinator', validateJWTAndSession, requireRole(['coordinator', 'admin']), async (req, res) => {
  try {
    const institutionId = req.user?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Coordenador deve estar associado a uma instituição'
      });
    }

    // Estatísticas da instituição
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      activeCourses
    ] = await Promise.all([
      db('users').join('roles', 'users.role_id', 'roles.id')
        .where('users.institution_id', institutionId)
        .where('roles.name', 'student')
        .where('users.is_active', true)
        .count('* as count').first().then(result => Number(result?.count) || 0),
      db('users').join('roles', 'users.role_id', 'roles.id')
        .where('users.institution_id', institutionId)
        .where('roles.name', 'teacher')
        .where('users.is_active', true)
        .count('* as count').first().then(result => Number(result?.count) || 0),
      db('courses')
        .where('institution_id', institutionId)
        .count('* as count').first().then(result => Number(result?.count) || 0),
      db('courses')
        .where('institution_id', institutionId)
        .where('status', 'published')
        .count('* as count').first().then(result => Number(result?.count) || 0)
    ]);

    // Performance dos cursos
    const coursePerformance = await db('courses')
      .join('users as teachers', 'courses.teacher_id', 'teachers.id')
      .select([
        'courses.id',
        'courses.title',
        'courses.status',
        'courses.created_at',
        'teachers.name as teacher_name'
      ])
      .where('courses.institution_id', institutionId)
      .orderBy('courses.created_at', 'desc')
      .limit(10);

    // Professores mais ativos
    const activeTeachers = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .leftJoin('courses', 'users.id', 'courses.teacher_id')
      .select([
        'users.id',
        'users.name',
        'users.email'
      ])
      .count('courses.id as course_count')
      .where('users.institution_id', institutionId)
      .where('roles.name', 'teacher')
      .where('users.is_active', true)
      .groupBy('users.id', 'users.name', 'users.email')
      .orderBy('course_count', 'desc')
      .limit(5);

    const dashboardData = {
      overview: {
        totalStudents,
        totalTeachers,
        totalCourses,
        activeCourses,
        averageAttendance: 0, // Seria calculado com dados de presença
        completionRate: 0 // Seria calculado com dados de progresso
      },
      coursePerformance,
      activeTeachers,
      monthlyStats: [], // Estatísticas mensais
      alerts: [] // Alertas do sistema
    };

    return res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching coordinator dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/guardian:
 *   get:
 *     summary: Get guardian dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Guardian dashboard data
 */
router.get('/guardian', validateJWTAndSession, requireRole(['guardian']), async (req, res) => {
  try {
    // Buscar filhos/estudantes associados ao responsável (simulado)
    // Seria necessária uma tabela de relacionamento guardians_students
    const students = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select([
        'users.id',
        'users.name',
        'users.email'
      ])
      .where('roles.name', 'student')
      .where('users.is_active', true)
      .limit(3); // Simulado

    // Para cada estudante, buscar informações acadêmicas
    const studentsData = await Promise.all(
      students.map(async (student) => {
        // Cursos do estudante (simulado)
        const courses = await db('courses')
          .select(['id', 'title'])
          .where('status', 'published')
          .limit(3);

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          grade: '9º Ano', // Simulado
          averageGrade: 8.5, // Simulado
          attendance: 95, // Simulado
          courses: courses.length,
          upcomingActivities: [] // Atividades próximas
        };
      })
    );

    const dashboardData = {
      students: studentsData,
      notifications: [], // Notificações para responsáveis
      calendar: [], // Eventos do calendário escolar
      summary: {
        totalStudents: studentsData.length,
        averageGrade: studentsData.reduce((acc, s) => acc + s.averageGrade, 0) / studentsData.length || 0,
        averageAttendance: studentsData.reduce((acc, s) => acc + s.attendance, 0) / studentsData.length || 0
      }
    };

    return res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching guardian dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router; 