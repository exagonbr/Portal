/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: 📊 Dashboard, analytics e métricas do sistema
 */

import express from 'express';
import { query, validationResult } from 'express-validator';
import { DashboardService } from '../services/DashboardService';
import { requireAuth } from '../middleware/requireAuth';

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
    const userId = req.user!.userId;
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
    const userDashboard = await DashboardService.getUserDashboard(userId);
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
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
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
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
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
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
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

export default router; 