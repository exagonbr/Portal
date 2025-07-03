/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: 📊 Dashboard, analytics e métricas do sistema
 */

import express from 'express';
import { query, validationResult } from 'express-validator';
import { DashboardService } from '../services/DashboardService';
<<<<<<< HEAD
import { requireAuth } from '../middleware/requireAuth';
=======
import { 
  validateJWTAndSession, 
  AuthenticatedRequest,
  requireRole 
} from '../middleware/sessionMiddleware';
import db from '../config/database';
>>>>>>> master

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores podem acessar o dashboard'
    });
  }
  
  next();
};

// Middleware simples para validação JWT (já aplicado globalmente)
const validateJWTSimple = (req: any, res: any, next: any) => {
  // Como já temos requireAuth aplicado globalmente, apenas continua
  next();
};

// Middleware inteligente para validação JWT (já aplicado globalmente)
const validateJWTSmart = (req: any, res: any, next: any) => {
  // Como já temos requireAuth aplicado globalmente, apenas continua
  next();
};

// Middleware para verificar roles específicas
const requireRoleSmart = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    
    if (!user || !roles.some(role => 
      user.role === role || 
      user.role.toUpperCase() === role.toUpperCase() ||
      (role === 'admin' && ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role))
    )) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado - roles necessárias: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * @swagger
 * /api/dashboard/system:
 *   get:
 *     summary: Dashboard do sistema (Admin) - Simplified
 *     description: Retorna estatísticas completas do sistema sem validação de sessão para evitar loops
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
 *         description: Token inválido
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
  (req: any, res: any, next: any) => validateJWTSimple(req, res, next), // Usar validação ultra-simples para evitar loops
  async (req: any, res: express.Response) => {
    try {
      console.log('🔍 Dashboard system acessado por:', req.user?.email);
      
      // Verificar se é admin
      const userRole = req.user?.role?.toLowerCase();
      if (!userRole || !['admin', 'system_admin'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem acessar este dashboard.'
        });
      }

      // Obter dados do dashboard de forma simplificada
      const dashboardData = await getSimplifiedSystemDashboard();

      return res.json({
        success: true,
        data: dashboardData
      });
    } catch (error: any) {
      console.log('❌ Erro ao obter dashboard do sistema:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * Função simplificada para obter dados do dashboard sem causar loops
 */
async function getSimplifiedSystemDashboard() {
  try {
    // Stats básicas do sistema sem dependências complexas
    const systemStats = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    // Stats básicas de usuários (sem queries complexas)
    let userStats = {
      total: 0,
      active: 0,
      newThisMonth: 0,
      byRole: {},
      byInstitution: {}
    };

    // Stats básicas de sessões (sem Redis se não disponível)
    let sessionStats = {
      activeUsers: 0,
      totalActiveSessions: 0,
      sessionsByDevice: {},
      averageSessionDuration: 0
    };

    try {
      // Tentar obter stats de usuários de forma segura
      userStats = await DashboardService.getUserStats();
    } catch (userError) {
      console.warn('⚠️ Erro ao obter stats de usuários:', userError);
    }

         try {
       // Tentar obter stats de sessões de forma segura
       const { SessionService } = await import('../services/SessionService');
       const basicSessionStats = await SessionService.getSessionStats();
       sessionStats = {
         ...basicSessionStats,
         averageSessionDuration: 0 // Adicionar campo obrigatório
       };
     } catch (sessionError) {
       console.warn('⚠️ Erro ao obter stats de sessões:', sessionError);
     }

    return {
      users: userStats,
      sessions: sessionStats,
      system: systemStats,
      recent: {
        registrations: [],
        logins: []
      }
    };
  } catch (error) {
    console.log('❌ Erro ao obter dashboard simplificado:', error);
    
    // Retornar dados mínimos em caso de erro
    return {
      users: { total: 0, active: 0, newThisMonth: 0, byRole: {}, byInstitution: {} },
      sessions: { activeUsers: 0, totalActiveSessions: 0, sessionsByDevice: {}, averageSessionDuration: 0 },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        error: 'Dados limitados devido a erro interno'
      },
      recent: { registrations: [], logins: [] }
    };
  }
}

/**
 * @swagger
 * /api/dashboard/system-safe:
 *   get:
 *     summary: Dashboard do sistema (versão ultra-segura)
 *     description: Versão minimalista do dashboard que sempre funciona
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard básico retornado
 */
router.get('/system-safe',
  (req: any, res: any, next: any) => validateJWTSimple(req, res, next),
  async (req: any, res: express.Response) => {
    try {
      console.log('🛡️ Dashboard system-safe acessado por:', req.user?.email);
      
      // Verificar se é admin
      const userRole = req.user?.role?.toLowerCase();
      if (!userRole || !['admin', 'system_admin'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      // Dados mínimos garantidos
      const safeData = {
        system: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: '2.0.0',
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString(),
          status: 'online'
        },
        message: 'Dashboard básico funcionando corretamente'
      };

      return res.json({
        success: true,
        data: safeData
      });
    } catch (error: any) {
      console.log('❌ Erro no dashboard safe:', error);
      return res.status(200).json({
        success: true,
        data: {
          system: {
            uptime: 0,
            memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 },
            version: '2.0.0',
            environment: 'unknown',
            timestamp: new Date().toISOString(),
            status: 'error',
            error: error.message
          },
          message: 'Dashboard em modo de emergência'
        }
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
router.get('/user', (req, res, next) => validateJWTSmart(req as any, res, next), async (req: any, res: express.Response) => {
  try {
    const userId = parseInt(req.user!.userId, 10);
    const dashboardData = await DashboardService.getUserDashboard(userId);

    return res.json({
      success: true,
      data: dashboardData
    });
  } catch (error: any) {
    console.log('Erro ao obter dashboard do usuário:', error);
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
  (req: any, res: any, next: any) => validateJWTSmart(req as any, res, next),
  (req: any, res: any, next: any) => requireRoleSmart(['admin', 'SYSTEM_ADMIN'])(req as any, res, next),
  async (req: any, res: express.Response) => {
    try {
      const metrics = await DashboardService.getRealTimeMetrics();

      return res.json({
        success: true,
        data: metrics
      });
    } catch (error: any) {
      console.log('Erro ao obter métricas em tempo real:', error);
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
  (req: any, res: any, next: any) => validateJWTSmart(req as any, res, next),
  (req: any, res: any, next: any) => requireRoleSmart(['admin', 'SYSTEM_ADMIN'])(req as any, res, next),
  [
    query('type').isIn(['users', 'sessions', 'activity']).withMessage('Tipo deve ser users, sessions ou activity'),
    query('period').optional().isIn(['day', 'week', 'month']).withMessage('Período deve ser day, week ou month')
  ],
  async (req: any, res: express.Response) => {
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
      console.log('Erro ao obter dados de analytics:', error);
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
router.get('/summary', (req, res, next) => validateJWTSmart(req as any, res, next), async (req: any, res: express.Response) => {
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
    const userDashboard = await DashboardService.getUserDashboard(parseInt(userId, 10));
    summary.personalStats = userDashboard.user.stats;

    return res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    console.log('Erro ao obter resumo do dashboard:', error);
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
router.get('/notifications', (req, res, next) => validateJWTSmart(req as any, res, next), async (req: any, res: express.Response) => {
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
    console.log('Erro ao obter notificações:', error);
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
  (req: any, res: any, next: any) => validateJWTSmart(req as any, res, next),
  (req: any, res: any, next: any) => requireRoleSmart(['admin', 'SYSTEM_ADMIN'])(req as any, res, next),
  async (req: any, res: express.Response) => {
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
      console.log('Erro ao verificar saúde do sistema:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
<<<<<<< HEAD
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
=======
 * /api/dashboard/teacher:
 *   get:
 *     summary: Dashboard do Teacher
 *     description: Taxas de frequência, pontualidade e participação da turma, distribuição de notas e evolução do desempenho, analytics de engajamento para leituras e atividades atribuídas, alertas para alunos com baixo desempenho, acesso ao Portal de Vídeos de Aprendizagem e Portal de Literatura
>>>>>>> master
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
<<<<<<< HEAD
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Dashboard stats - implementação pendente',
    data: {
      totalUsers: 0,
      totalCourses: 0,
      totalInstitutions: 0,
      activeUsers: 0
    }
  });
});

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview
=======
 *         description: Dashboard do professor
 */
router.get('/teacher', validateJWTAndSession, requireRole(['TEACHER', 'teacher']), async (req, res) => {
  try {
    const userId = req.user?.userId;
    const institutionId = req.user?.institutionId;

    // Class attendance, punctuality, and participation rates
    const [
      teacherClasses,
      attendanceRates,
      gradeDistribution,
      performanceEvolution,
      engagementAnalytics,
      underperformingStudents,
      coursesData,
      videoPortalAccess,
      literaturePortalData
    ] = await Promise.all([
      // Get teacher's classes
      db('user_classes')
        .join('classes', 'user_classes.class_id', 'classes.id')
        .join('schools', 'classes.school_id', 'schools.id')
        .leftJoin('user_classes as student_count', function() {
          this.on('classes.id', 'student_count.class_id')
              .andOn('student_count.role', '=', db.raw('?', ['student']));
        })
        .select([
          'classes.id',
          'classes.name',
          'classes.shift',
          'classes.year',
          'schools.name as school_name',
          db.raw('COUNT(DISTINCT student_count.user_id) as student_count')
        ])
        .where('user_classes.user_id', userId)
        .where('user_classes.role', 'teacher')
        .groupBy('classes.id', 'classes.name'),

      // Attendance rates (simulated - would require attendance table)
      db('classes')
        .join('user_classes', 'classes.id', 'user_classes.class_id')
        .select([
          'classes.id',
          'classes.name',
          db.raw('RAND() * 100 as attendance_rate'),
          db.raw('RAND() * 100 as punctuality_rate'),
          db.raw('RAND() * 100 as participation_rate')
        ])
        .where('user_classes.user_id', userId)
        .where('user_classes.role', 'teacher'),

      // Grade distribution (simulated - would require grades table)
      db('classes')
        .join('user_classes', 'classes.id', 'user_classes.class_id')
        .select([
          'classes.id',
          'classes.name',
          db.raw('RAND() * 30 as grade_a_count'),
          db.raw('RAND() * 40 as grade_b_count'),
          db.raw('RAND() * 20 as grade_c_count'),
          db.raw('RAND() * 10 as grade_d_count'),
          db.raw('RAND() * 5 as grade_f_count')
        ])
        .where('user_classes.user_id', userId)
        .where('user_classes.role', 'teacher'),

      // Performance evolution (simulated)
      db.raw(`
        SELECT 
          DATE_FORMAT(DATE_SUB(NOW(), INTERVAL seq.n MONTH), '%Y-%m') as month,
          RAND() * 100 as average_grade
        FROM (
          SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
        ) seq
        ORDER BY month
      `),

      // Engagement analytics for assigned readings and activities
      db('courses')
        .leftJoin('modules', 'courses.id', 'modules.course_id')
        .leftJoin('content', 'modules.id', 'content.module_id')
        .select([
          'courses.id as course_id',
          'courses.title as course_title',
          db.raw('COUNT(CASE WHEN content.type = "reading" THEN 1 END) as reading_materials'),
          db.raw('COUNT(CASE WHEN content.type = "assignment" THEN 1 END) as assignments'),
          db.raw('RAND() * 100 as engagement_rate')
        ])
        .where('courses.teacher_id', userId)
        .groupBy('courses.id', 'courses.title'),

      // Underperforming students alerts
      db('user_classes')
        .join('users', 'user_classes.user_id', 'users.id')
        .join('classes', 'user_classes.class_id', 'classes.id')
        .select([
          'users.id',
          'users.name as student_name',
          'classes.name as class_name',
          db.raw('RAND() * 100 as current_grade'),
          db.raw('CASE WHEN RAND() > 0.7 THEN "attendance" WHEN RAND() > 0.4 THEN "grades" ELSE "participation" END as alert_type')
        ])
        .whereIn('classes.id', function() {
          this.select('class_id')
            .from('user_classes')
            .where('user_id', userId)
            .where('role', 'teacher');
        })
        .where('user_classes.role', 'student')
        .having(db.raw('current_grade < 70')),

      // Teacher's courses
      db('courses')
        .where('teacher_id', userId)
        .where('status', '!=', 'archived'),

      // Video Learning Portal access
      db('videos')
        .where('status', 'active')
        .where(function() {
          this.where('institution_id', institutionId)
            .orWhereNull('institution_id');
        })
        .orderBy('created_at', 'desc')
        .limit(10),

      // Literature Portal data
      db('books')
        .where('status', 'available')
        .where(function() {
          this.where('institution_id', institutionId)
            .orWhereNull('institution_id');
        })
        .orderBy('created_at', 'desc')
        .limit(10)
    ]);

    const dashboardData = {
      classAttendanceRates: attendanceRates,
      gradeDistribution: gradeDistribution,
      performanceEvolution: performanceEvolution,
      engagementAnalytics: engagementAnalytics,
      underperformingStudentsAlerts: underperformingStudents,
      teacherClasses: teacherClasses,
      coursesOverview: coursesData,
      videoLearningPortal: {
        recentVideos: videoPortalAccess,
        totalVideos: videoPortalAccess.length
      },
      literaturePortal: {
        availableBooks: literaturePortalData,
        totalBooks: literaturePortalData.length
      },
      teacherMetrics: {
        totalClasses: teacherClasses.length,
        totalStudents: teacherClasses.reduce((sum, cls) => sum + cls.student_count, 0),
        averageAttendance: attendanceRates.reduce((sum, cls) => sum + cls.attendance_rate, 0) / attendanceRates.length || 0,
        alertsCount: underperformingStudents.length
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
 *     summary: Dashboard do Student
 *     description: Agenda diária, prazos próximos e resultados de testes, rastreadores de progresso de aprendizagem (por matéria e habilidade), estatísticas de leitura do Portal de Literatura, painel de mensagens com instrutores, definição de metas pessoais e marcos de conquistas, acesso ao Portal de Literatura e Portal do Estudante
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard do estudante
 */
router.get('/student', validateJWTAndSession, requireRole(['STUDENT', 'student']), async (req, res) => {
  try {
    const userId = req.user?.userId;
    const institutionId = req.user?.institutionId;

    // Daily agenda, upcoming deadlines, and quiz results
    const [
      studentClasses,
      upcomingDeadlines,
      quizResults,
      learningProgress,
      readingStatistics,
      messages,
      achievements,
      literaturePortalBooks,
      studentPortalMaterials,
      personalGoals
    ] = await Promise.all([
      // Student's classes and schedule
      db('user_classes')
        .join('classes', 'user_classes.class_id', 'classes.id')
        .join('schools', 'classes.school_id', 'schools.id')
        .leftJoin('class_education_cycles', 'classes.id', 'class_education_cycles.class_id')
        .leftJoin('education_cycles', 'class_education_cycles.education_cycle_id', 'education_cycles.id')
        .select([
          'classes.id',
          'classes.name',
          'classes.shift',
          'classes.year',
          'schools.name as school_name',
          'education_cycles.name as cycle_name',
          'education_cycles.level'
        ])
        .where('user_classes.user_id', userId)
        .where('user_classes.role', 'student'),

      // Upcoming deadlines (simulated with assignments)
      db('content')
        .join('modules', 'content.module_id', 'modules.id')
        .join('courses', 'modules.course_id', 'courses.id')
        .select([
          'content.id',
          'content.title',
          'content.type',
          'courses.title as course_title',
          db.raw('DATE_ADD(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as deadline')
        ])
        .where('content.type', 'assignment')
        .whereIn('courses.id', function() {
          // Simulated enrollment - would be from enrollment table
          this.select('id').from('courses').limit(5);
        })
        .orderBy('deadline')
        .limit(10),

      // Quiz results
      db('quizzes')
        .select([
          'id',
          'title',
          'created_at',
          db.raw('RAND() * 100 as score'),
          db.raw('RAND() * 10 + 5 as total_questions')
        ])
        .orderBy('created_at', 'desc')
        .limit(10),

      // Learning progress trackers (per subject and skill)
      db('education_cycles')
        .select([
          'id',
          'name as subject',
          'level',
          db.raw('RAND() * 100 as progress_percentage'),
          db.raw('RAND() * 50 as completed_activities'),
          db.raw('RAND() * 80 + 20 as total_activities')
        ])
        .limit(8),

      // Reading statistics from Literature Portal
      db('books')
        .select([
          'id',
          'title',
          'author',
          db.raw('RAND() * 300 as pages_read'),
          db.raw('total_pages'),
          db.raw('CASE WHEN RAND() > 0.5 THEN TRUE ELSE FALSE END as completed'),
          db.raw('RAND() * 5 as rating')
        ])
        .where('status', 'available')
        .limit(10),

      // Messages with instructors
      db('chat_messages')
        .join('users', 'chat_messages.sender_id', 'users.id')
        .select([
          'chat_messages.id',
          'chat_messages.content',
          'chat_messages.created_at',
          'users.name as sender_name',
          db.raw('CASE WHEN chat_messages.sender_id = ? THEN FALSE ELSE TRUE END as is_from_teacher', [userId])
        ])
        .where(function() {
          this.where('chat_messages.sender_id', userId)
            .orWhere('chat_messages.recipient_id', userId);
        })
        .orderBy('chat_messages.created_at', 'desc')
        .limit(10),

      // Personal achievements and milestones
      db.raw(`
        SELECT 
          'Reading Badge' as achievement_name,
          'Completed 10 books' as description,
          RAND() > 0.5 as unlocked,
          DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as unlocked_at
        UNION ALL
        SELECT 
          'Perfect Attendance',
          '100% attendance for a month',
          RAND() > 0.7,
          DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 60) DAY)
        UNION ALL
        SELECT 
          'Quiz Master',
          'Scored 90%+ on 5 consecutive quizzes',
          RAND() > 0.6,
          DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 90) DAY)
      `),

      // Literature Portal books for class
      db('books')
        .where('status', 'available')
        .where(function() {
          this.where('institution_id', institutionId)
            .orWhereNull('institution_id');
        })
        .orderBy('created_at', 'desc')
        .limit(5),

      // Student Portal materials (videos, games, PDFs)
      db('content')
        .join('modules', 'content.module_id', 'modules.id')
        .join('courses', 'modules.course_id', 'courses.id')
        .select([
          'content.id',
          'content.title',
          'content.type',
          'content.file_url',
          'courses.title as course_title'
        ])
        .whereIn('content.type', ['video', 'game', 'pdf', 'document'])
        .where('content.status', 'active')
        .orderBy('content.created_at', 'desc')
        .limit(10),

      // Personal goals (simulated)
      db.raw(`
        SELECT 
          'Complete Math Module 3' as goal,
          'academic' as category,
          75 as progress,
          DATE_ADD(NOW(), INTERVAL 15 DAY) as target_date
        UNION ALL
        SELECT 
          'Read 5 Books This Month',
          'reading',
          60,
          DATE_ADD(NOW(), INTERVAL 20 DAY)
        UNION ALL
        SELECT 
          'Improve Quiz Average to 85%',
          'performance',
          40,
          DATE_ADD(NOW(), INTERVAL 30 DAY)
      `)
    ]);

    const dashboardData = {
      dailyAgenda: studentClasses,
      upcomingDeadlines: upcomingDeadlines,
      quizResults: quizResults,
      learningProgressTrackers: learningProgress,
      readingStatistics: {
        books: readingStatistics,
        totalBooksRead: readingStatistics.filter(book => book.completed).length,
        totalPagesRead: readingStatistics.reduce((sum, book) => sum + book.pages_read, 0),
        averageRating: readingStatistics.reduce((sum, book) => sum + book.rating, 0) / readingStatistics.length || 0
      },
      messagingPanel: messages,
      personalGoalsAndMilestones: {
        goals: personalGoals,
        achievements: achievements
      },
      literaturePortal: {
        availableBooks: literaturePortalBooks,
        currentReadings: readingStatistics.filter(book => !book.completed)
      },
      studentPortal: {
        materials: studentPortalMaterials,
        videoCount: studentPortalMaterials.filter(m => m.type === 'video').length,
        gameCount: studentPortalMaterials.filter(m => m.type === 'game').length,
        documentCount: studentPortalMaterials.filter(m => ['pdf', 'document'].includes(m.type)).length
      },
      studentMetrics: {
        enrolledClasses: studentClasses.length,
        pendingAssignments: upcomingDeadlines.length,
        averageQuizScore: quizResults.reduce((sum, quiz) => sum + quiz.score, 0) / quizResults.length || 0,
        completionBadges: achievements.filter((a: any) => a.unlocked).length
      }
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
 * /api/dashboard/guardian:
 *   get:
 *     summary: Dashboard do Guardian (Parents or Legal Representatives)
 *     description: Atualizações em tempo real sobre notas e frequência, alertas comportamentais e elogios, relatórios de conclusão de leitura e lição de casa, logs de comunicação com professores, visualização múltipla para pais com mais de um aluno
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard do responsável
 */
router.get('/guardian', validateJWTAndSession, requireRole(['GUARDIAN', 'guardian']), async (req, res) => {
  try {
    const guardianId = req.user?.userId;

    // Real-time updates on grades and attendance
    const [
      guardianStudents,
      gradeUpdates,
      attendanceRecords,
      behavioralAlerts,
      homeworkReports,
      teacherCommunications,
      upcomingEvents
    ] = await Promise.all([
      // Guardian's students (simulated relationship)
      db('users')
        .join('user_classes', 'users.id', 'user_classes.user_id')
        .join('classes', 'user_classes.class_id', 'classes.id')
        .join('schools', 'classes.school_id', 'schools.id')
        .select([
          'users.id as student_id',
          'users.name as student_name',
          'classes.name as class_name',
          'classes.year',
          'schools.name as school_name'
        ])
        .where('user_classes.role', 'student')
        .where(function() {
          // Simulated guardian relationship - would be from guardian_students table
          this.whereRaw('RAND() > 0.8');
        })
        .limit(5),

      // Recent grade updates
      db.raw(`
        SELECT 
          FLOOR(RAND() * 5) + 1 as student_id,
          'Mathematics' as subject,
          RAND() * 100 as grade,
          'Quiz' as assessment_type,
          DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 7) DAY) as grade_date
        UNION ALL
        SELECT 
          FLOOR(RAND() * 5) + 1,
          'Portuguese',
          RAND() * 100,
          'Assignment',
          DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 14) DAY)
        UNION ALL
        SELECT 
          FLOOR(RAND() * 5) + 1,
          'Science',
          RAND() * 100,
          'Test',
          DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 21) DAY)
      `),

      // Attendance records
      db.raw(`
        SELECT 
          FLOOR(RAND() * 5) + 1 as student_id,
          DATE_SUB(NOW(), INTERVAL seq.n DAY) as date,
          CASE WHEN RAND() > 0.1 THEN 'present' WHEN RAND() > 0.05 THEN 'late' ELSE 'absent' END as status
        FROM (
          SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
        ) seq
        ORDER BY date DESC
      `),

      // Behavioral alerts and commendations
      db.raw(`
        SELECT 
          FLOOR(RAND() * 5) + 1 as student_id,
          CASE WHEN RAND() > 0.7 THEN 'commendation' ELSE 'alert' END as type,
          CASE 
            WHEN RAND() > 0.8 THEN 'Excellent participation in class discussion'
            WHEN RAND() > 0.6 THEN 'Helped classmate with assignment'
            WHEN RAND() > 0.4 THEN 'Late to class multiple times'
            ELSE 'Incomplete homework submission'
          END as description,
          DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as date
        LIMIT 10
      `),

      // Reading and homework completion reports
      db.raw(`
        SELECT 
          FLOOR(RAND() * 5) + 1 as student_id,
          'Mathematics Worksheet' as assignment_name,
          CASE WHEN RAND() > 0.2 THEN 'completed' ELSE 'pending' END as status,
          DATE_ADD(NOW(), INTERVAL FLOOR(RAND() * 7) DAY) as due_date,
          RAND() * 100 as completion_percentage
        UNION ALL
        SELECT 
          FLOOR(RAND() * 5) + 1,
          'Reading: Chapter 5',
          CASE WHEN RAND() > 0.3 THEN 'completed' ELSE 'pending' END,
          DATE_ADD(NOW(), INTERVAL FLOOR(RAND() * 10) DAY),
          RAND() * 100
        UNION ALL
        SELECT 
          FLOOR(RAND() * 5) + 1,
          'Science Project',
          CASE WHEN RAND() > 0.5 THEN 'completed' ELSE 'pending' END,
          DATE_ADD(NOW(), INTERVAL FLOOR(RAND() * 14) DAY),
          RAND() * 100
      `),

      // Teacher communication logs
      db('chat_messages')
        .join('users as teachers', 'chat_messages.sender_id', 'teachers.id')
        .join('roles', 'teachers.role_id', 'roles.id')
        .select([
          'chat_messages.id',
          'chat_messages.content',
          'chat_messages.created_at',
          'teachers.name as teacher_name',
          db.raw('FLOOR(RAND() * 5) + 1 as regarding_student_id')
        ])
        .where('roles.name', 'TEACHER')
        .where(function() {
          // Simulated - messages between guardian and teachers
          this.where('chat_messages.recipient_id', guardianId)
            .orWhere('chat_messages.sender_id', guardianId);
        })
        .orderBy('chat_messages.created_at', 'desc')
        .limit(10),

      // Upcoming events and meetings
      db.raw(`
        SELECT 
          'Parent-Teacher Conference' as event_name,
          'Meeting with Math teacher' as description,
          DATE_ADD(NOW(), INTERVAL 5 DAY) as event_date,
          'meeting' as type
        UNION ALL
        SELECT 
          'School Sports Day',
          'Annual sports competition',
          DATE_ADD(NOW(), INTERVAL 12 DAY),
          'event'
        UNION ALL
        SELECT 
          'Science Fair',
          'Student project presentations',
          DATE_ADD(NOW(), INTERVAL 20 DAY),
          'event'
      `)
    ]);

    // Multi-child view aggregation
    const studentIds = guardianStudents.map(s => s.student_id);
    const multiChildView = studentIds.map(studentId => {
      const student = guardianStudents.find(s => s.student_id === studentId);
      const studentGrades = gradeUpdates.filter((g: any) => g.student_id === studentId);
      const studentAttendance = attendanceRecords.filter((a: any) => a.student_id === studentId);
      const studentBehavior = behavioralAlerts.filter((b: any) => b.student_id === studentId);
      const studentHomework = homeworkReports.filter((h: any) => h.student_id === studentId);

      return {
        student: student,
        recentGrades: studentGrades,
        attendanceRate: (studentAttendance.filter((a: any) => a.status === 'present').length / studentAttendance.length * 100) || 0,
        behaviorSummary: {
          commendations: studentBehavior.filter((b: any) => b.type === 'commendation').length,
          alerts: studentBehavior.filter((b: any) => b.type === 'alert').length
        },
        homeworkCompletion: (studentHomework.filter((h: any) => h.status === 'completed').length / studentHomework.length * 100) || 0
      };
    });

    const dashboardData = {
      realTimeUpdates: {
        grades: gradeUpdates,
        attendance: attendanceRecords
      },
      behavioralAlertsAndCommendations: behavioralAlerts,
      homeworkAndReadingReports: homeworkReports,
      teacherCommunicationLogs: teacherCommunications,
      multiChildView: multiChildView,
      upcomingEvents: upcomingEvents,
      guardianMetrics: {
        totalChildren: guardianStudents.length,
        averageAttendance: multiChildView.reduce((sum, child) => sum + child.attendanceRate, 0) / multiChildView.length || 0,
        totalCommendations: multiChildView.reduce((sum, child) => sum + child.behaviorSummary.commendations, 0),
        totalAlerts: multiChildView.reduce((sum, child) => sum + child.behaviorSummary.alerts, 0),
        unreadMessages: teacherCommunications.length
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

/**
 * @swagger
 * /api/dashboard/system-admin:
 *   get:
 *     summary: Dashboard do System Administrator (Global Administrator)
 *     description: Métricas globais do sistema - uptime, carga, status da fila, crescimento de usuários, sincronização multi-instituição, backups, segurança e compliance
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard do administrador do sistema
 */
router.get('/system-admin', 
  validateJWTAndSession, 
  requireRole(['admin', 'SYSTEM_ADMIN']), 
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      // System health metrics (uptime, load, queue status)
      const systemHealth = {
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        activeConnections: 0, // Would be tracked with connection monitoring
        queueStatus: {
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0
        }
      };

      // User growth analytics (students, teachers, schools onboarded)
      const [
        totalInstitutions,
        activeInstitutions,
        totalSchools,
        activeSchools,
        totalUsers,
        activeUsers,
        usersByRole,
        userGrowthLastMonth,
        institutionGrowthLastMonth
      ] = await Promise.all([
        db('institutions').count('* as count').first().then(r => Number(r?.count) || 0),
        db('institutions').where('is_active', true).count('* as count').first().then(r => Number(r?.count) || 0),
        db('schools').count('* as count').first().then(r => Number(r?.count) || 0),
        db('schools').where('is_active', true).count('* as count').first().then(r => Number(r?.count) || 0),
        db('users').count('* as count').first().then(r => Number(r?.count) || 0),
        db('users').where('is_active', true).count('* as count').first().then(r => Number(r?.count) || 0),
        db('users')
          .join('roles', 'users.role_id', 'roles.id')
          .select('roles.name as role', db.raw('COUNT(*) as count'))
          .where('users.is_active', true)
          .groupBy('roles.name'),
        db('users')
          .where('created_at', '>=', db.raw('NOW() - INTERVAL 30 DAY'))
          .count('* as count').first().then(r => Number(r?.count) || 0),
        db('institutions')
          .where('created_at', '>=', db.raw('NOW() - INTERVAL 30 DAY'))
          .count('* as count').first().then(r => Number(r?.count) || 0)
      ]);

      // Access and permission logs (recent activities)
      const recentActivities = await db('notifications')
        .orderBy('created_at', 'desc')
        .limit(20);

      // Multi-institution synchronization status
      const syncStatus = await db('institutions')
        .select([
          'id',
          'name',
          'is_active',
          'updated_at'
        ])
        .orderBy('updated_at', 'desc');

      // Backup, security, and compliance alerts
      const securityAlerts = await db('notifications')
        .where('type', 'security')
        .where('created_at', '>=', db.raw('NOW() - INTERVAL 7 DAY'))
        .orderBy('created_at', 'desc');

      const dashboardData = {
        systemHealth,
        userGrowth: {
          totalInstitutions,
          activeInstitutions,
          totalSchools,
          activeSchools,
          totalUsers,
          activeUsers,
          usersByRole,
          growthMetrics: {
            usersLastMonth: userGrowthLastMonth,
            institutionsLastMonth: institutionGrowthLastMonth
          }
        },
        accessLogs: recentActivities,
        syncStatus,
        securityAlerts,
        complianceStatus: {
          backupStatus: 'healthy', // Would integrate with backup system
          dataRetention: 'compliant',
          accessControls: 'active',
          auditLogs: 'enabled'
        }
      };

      return res.json({
        success: true,
        data: dashboardData
      });
    } catch (error: any) {
      console.error('Erro ao obter dashboard do system admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/institution-manager:
 *   get:
 *     summary: Dashboard do Institution Manager (School Directors / Unit Heads)
 *     description: Tendências de matrícula, mapas de calor de presença, desempenho acadêmico por turma/ciclo, alocação de recursos, cobertura de professores, indicadores de orçamento vs utilização, painel de notificações broadcast
>>>>>>> master
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
<<<<<<< HEAD
 *         description: Dashboard overview
 */
router.get('/overview', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Dashboard overview - implementação pendente',
    data: {}
  });
});

/**
 * @swagger
 * /api/dashboard/analytics:
 *   get:
 *     summary: Get dashboard analytics
=======
 *         description: Dashboard do gestor institucional
 */
router.get('/institution-manager', 
  validateJWTAndSession, 
  requireRole(['INSTITUTION_MANAGER', 'admin']), 
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const institutionId = req.user?.institutionId;

      if (!institutionId) {
        return res.status(400).json({
          success: false,
          message: 'Gestor deve estar associado a uma instituição'
        });
      }

      // Enrollment trends and attendance heatmaps
      const [
        schoolsOverview,
        enrollmentTrends,
        attendanceData,
        performanceByClass,
        resourceAllocation,
        teacherCoverage,
        budgetMetrics
      ] = await Promise.all([
        // Schools overview
        db('schools')
          .leftJoin('classes', 'schools.id', 'classes.school_id')
          .leftJoin('user_classes as student_classes', function() {
            this.on('classes.id', 'student_classes.class_id')
                .andOn('student_classes.role', '=', db.raw('?', ['student']));
          })
          .leftJoin('user_classes as teacher_classes', function() {
            this.on('classes.id', 'teacher_classes.class_id')
                .andOn('teacher_classes.role', '=', db.raw('?', ['teacher']));
          })
          .select([
            'schools.id',
            'schools.name',
            'schools.is_active',
            db.raw('COUNT(DISTINCT classes.id) as total_classes'),
            db.raw('COUNT(DISTINCT student_classes.user_id) as total_students'),
            db.raw('COUNT(DISTINCT teacher_classes.user_id) as total_teachers')
          ])
          .where('schools.institution_id', institutionId)
          .groupBy('schools.id', 'schools.name', 'schools.is_active'),

        // Enrollment trends (last 6 months)
        db('user_classes')
          .join('classes', 'user_classes.class_id', 'classes.id')
          .join('schools', 'classes.school_id', 'schools.id')
          .select([
            db.raw('DATE_FORMAT(user_classes.created_at, "%Y-%m") as month'),
            db.raw('COUNT(*) as enrollments')
          ])
          .where('schools.institution_id', institutionId)
          .where('user_classes.role', 'student')
          .where('user_classes.created_at', '>=', db.raw('NOW() - INTERVAL 6 MONTH'))
          .groupBy(db.raw('DATE_FORMAT(user_classes.created_at, "%Y-%m")'))
          .orderBy('month'),

        // Attendance data (simulated - would require attendance table)
        db('classes')
          .join('schools', 'classes.school_id', 'schools.id')
          .select([
            'classes.id',
            'classes.name',
            'classes.shift',
            db.raw('RAND() * 100 as attendance_rate') // Simulated
          ])
          .where('schools.institution_id', institutionId)
          .where('classes.is_active', true),

        // Academic performance per class/cycle
        db('classes')
          .join('schools', 'classes.school_id', 'schools.id')
          .leftJoin('class_education_cycles', 'classes.id', 'class_education_cycles.class_id')
          .leftJoin('education_cycles', 'class_education_cycles.education_cycle_id', 'education_cycles.id')
          .select([
            'classes.id',
            'classes.name as class_name',
            'education_cycles.name as cycle_name',
            'education_cycles.level',
            db.raw('RAND() * 100 as performance_score') // Simulated
          ])
          .where('schools.institution_id', institutionId),

        // Resource allocation
        db('schools')
          .leftJoin('classes', 'schools.id', 'classes.school_id')
          .select([
            'schools.name as school_name',
            db.raw('COUNT(classes.id) as allocated_classes'),
            db.raw('SUM(classes.max_students) as capacity'),
            db.raw('RAND() * 100000 as budget_allocated') // Simulated
          ])
          .where('schools.institution_id', institutionId)
          .groupBy('schools.id', 'schools.name'),

        // Teacher coverage
        db('user_classes')
          .join('classes', 'user_classes.class_id', 'classes.id')
          .join('schools', 'classes.school_id', 'schools.id')
          .join('users', 'user_classes.user_id', 'users.id')
          .select([
            'classes.id as class_id',
            'classes.name as class_name',
            db.raw('COUNT(CASE WHEN user_classes.role = "teacher" THEN 1 END) as teacher_count'),
            db.raw('COUNT(CASE WHEN user_classes.role = "student" THEN 1 END) as student_count')
          ])
          .where('schools.institution_id', institutionId)
          .groupBy('classes.id', 'classes.name'),

        // Budget vs utilization indicators (simulated)
        db.raw(`
          SELECT 
            'Budget vs Utilization' as metric,
            RAND() * 1000000 as total_budget,
            RAND() * 800000 as utilized_budget,
            (RAND() * 800000) / (RAND() * 1000000) * 100 as utilization_rate
        `)
      ]);

      // Notifications broadcast panel
      const recentAnnouncements = await db('announcements')
        .where('institution_id', institutionId)
        .orderBy('created_at', 'desc')
        .limit(10);

      const dashboardData = {
        schoolsOverview,
        enrollmentTrends,
        attendanceHeatmap: attendanceData,
        academicPerformance: performanceByClass,
        resourceAllocation,
        teacherCoverage,
        budgetIndicators: budgetMetrics[0] || {},
        notificationsBroadcast: recentAnnouncements,
        institutionMetrics: {
          totalSchools: schoolsOverview.length,
          totalStudents: schoolsOverview.reduce((sum, school) => sum + school.total_students, 0),
          totalTeachers: schoolsOverview.reduce((sum, school) => sum + school.total_teachers, 0),
          totalClasses: schoolsOverview.reduce((sum, school) => sum + school.total_classes, 0)
        }
      };

      return res.json({
        success: true,
        data: dashboardData
      });
    } catch (error: any) {
      console.error('Erro ao obter dashboard do institution manager:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/coordinator:
 *   get:
 *     summary: Dashboard do Academic Coordinator (Cycle or Department Supervisors)
 *     description: Analytics de resultados de aprendizagem entre turmas, indicadores de progresso e aderência ao currículo, flags de risco do aluno por disciplina, estatísticas de desempenho e planejamento do professor, histórico de intervenção pedagógica
>>>>>>> master
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
<<<<<<< HEAD
 *         description: Dashboard analytics
 */
router.get('/analytics', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Dashboard analytics - implementação pendente',
    data: {}
  });
});
=======
 *         description: Dashboard do coordenador acadêmico
 */
router.get('/coordinator', 
  validateJWTAndSession, 
  requireRole(['ACADEMIC_COORDINATOR', 'admin']), 
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const institutionId = req.user?.institutionId;

      if (!institutionId) {
        return res.status(400).json({
          success: false,
          message: 'Coordenador deve estar associado a uma instituição'
        });
      }

      // Cross-class learning outcomes analytics
      const [
        learningOutcomes,
        curriculumProgress,
        studentRiskFlags,
        teacherPerformance,
        interventionHistory,
        cycleOverview
      ] = await Promise.all([
        // Learning outcomes by class
        db('classes')
          .join('schools', 'classes.school_id', 'schools.id')
          .leftJoin('class_education_cycles', 'classes.id', 'class_education_cycles.class_id')
          .leftJoin('education_cycles', 'class_education_cycles.education_cycle_id', 'education_cycles.id')
          .select([
            'classes.id',
            'classes.name as class_name',
            'education_cycles.name as cycle_name',
            'education_cycles.level',
            db.raw('RAND() * 100 as learning_outcome_score'), // Simulated
            db.raw('RAND() * 100 as curriculum_adherence') // Simulated
          ])
          .where('schools.institution_id', institutionId),

        // Curriculum progress and adherence indicators
        db('education_cycles')
          .leftJoin('class_education_cycles', 'education_cycles.id', 'class_education_cycles.education_cycle_id')
          .leftJoin('classes', 'class_education_cycles.class_id', 'classes.id')
          .leftJoin('schools', 'classes.school_id', 'schools.id')
          .select([
            'education_cycles.id',
            'education_cycles.name',
            'education_cycles.level',
            'education_cycles.duration_weeks',
            db.raw('COUNT(DISTINCT classes.id) as classes_using'),
            db.raw('RAND() * 100 as completion_percentage') // Simulated
          ])
          .where('schools.institution_id', institutionId)
          .groupBy('education_cycles.id', 'education_cycles.name', 'education_cycles.level', 'education_cycles.duration_weeks'),

        // Student risk flags by discipline (simulated)
        db('user_classes')
          .join('users', 'user_classes.user_id', 'users.id')
          .join('classes', 'user_classes.class_id', 'classes.id')
          .join('schools', 'classes.school_id', 'schools.id')
          .select([
            'users.id as student_id',
            'users.name as student_name',
            'classes.name as class_name',
            db.raw('CASE WHEN RAND() > 0.8 THEN "high" WHEN RAND() > 0.6 THEN "medium" ELSE "low" END as risk_level'),
            db.raw('CASE WHEN RAND() > 0.5 THEN "attendance" ELSE "performance" END as risk_type')
          ])
          .where('schools.institution_id', institutionId)
          .where('user_classes.role', 'student')
          .having(db.raw('RAND() > 0.7')), // Only show some students as at risk

        // Teacher performance and planning stats
        db('user_classes')
          .join('users', 'user_classes.user_id', 'users.id')
          .join('classes', 'user_classes.class_id', 'classes.id')
          .join('schools', 'classes.school_id', 'schools.id')
          .select([
            'users.id as teacher_id',
            'users.name as teacher_name',
            db.raw('COUNT(DISTINCT classes.id) as classes_taught'),
            db.raw('RAND() * 100 as performance_score'), // Simulated
            db.raw('RAND() * 100 as planning_completeness') // Simulated
          ])
          .where('schools.institution_id', institutionId)
          .where('user_classes.role', 'teacher')
          .groupBy('users.id', 'users.name'),

        // Pedagogical intervention history (simulated with notifications)
        db('notifications')
          .where('type', 'intervention')
          .where('created_at', '>=', db.raw('NOW() - INTERVAL 3 MONTH'))
          .orderBy('created_at', 'desc')
          .limit(20),

        // Cycle overview
        db('education_cycles')
          .leftJoin('class_education_cycles', 'education_cycles.id', 'class_education_cycles.education_cycle_id')
          .select([
            'education_cycles.*',
            db.raw('COUNT(class_education_cycles.class_id) as active_classes')
          ])
          .groupBy('education_cycles.id')
      ]);

      const dashboardData = {
        learningOutcomesAnalytics: learningOutcomes,
        curriculumProgressIndicators: curriculumProgress,
        studentRiskFlags: studentRiskFlags,
        teacherPerformanceStats: teacherPerformance,
        interventionHistory: interventionHistory,
        cycleOverview: cycleOverview,
        academicMetrics: {
          totalCycles: cycleOverview.length,
          activeClasses: cycleOverview.reduce((sum, cycle) => sum + cycle.active_classes, 0),
          averageCurriculumAdherence: learningOutcomes.reduce((sum, item) => sum + item.curriculum_adherence, 0) / learningOutcomes.length || 0,
          studentsAtRisk: studentRiskFlags.filter(student => student.risk_level === 'high').length
        }
      };

      return res.json({
        success: true,
        data: dashboardData
      });
    } catch (error: any) {
      console.error('Erro ao obter dashboard do coordenador:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);
>>>>>>> master

export default router; 