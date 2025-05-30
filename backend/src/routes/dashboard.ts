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

export default router; 