import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import ActivityTrackingService from '../services/ActivityTrackingService';
import { ActivityFilter } from '../services/ActivityTrackingService';

const router = Router();

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Middleware para verificar permissões de auditoria
const requireAuditPermission = (req: any, res: any, next: any) => {
  const allowedRoles = ['admin', 'system_admin', 'auditor', 'manager'];
  const userRole = (req.user as any)?.role;
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissão de auditoria necessária.'
    });
  }
  
  next();
};

// GET /api/activity-tracking/activities
// Busca atividades com filtros
router.get('/activities', requireAuditPermission, async (req, res) => {
  try {
    const filter: ActivityFilter = {
      userId: req.query.userId as string,
      sessionId: req.query.sessionId as string,
      activityType: req.query.activityType as any,
      entityType: req.query.entityType as string,
      entityId: req.query.entityId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      ipAddress: req.query.ipAddress as string,
      success: req.query.success ? req.query.success === 'true' : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      orderBy: req.query.orderBy as any || 'created_at',
      order: req.query.order as any || 'desc'
    };

    const activities = await ActivityTrackingService.getActivities(filter);

    res.json({
      success: true,
      data: activities,
      pagination: {
        limit: filter.limit,
        offset: filter.offset,
        total: activities.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar atividades'
    });
  }
});

// GET /api/activity-tracking/stats
// Obtém estatísticas de atividade
router.get('/stats', requireAuditPermission, async (req, res) => {
  try {
    const filter: ActivityFilter = {
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      userId: req.query.userId as string,
      activityType: req.query.activityType as any
    };

    const stats = await ActivityTrackingService.getActivityStats(filter);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas'
    });
  }
});

// GET /api/activity-tracking/sessions/active
// Busca sessões ativas
router.get('/sessions/active', requireAuditPermission, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const sessions = await ActivityTrackingService.getActiveSessions(limit);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Erro ao buscar sessões ativas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar sessões ativas'
    });
  }
});

// GET /api/activity-tracking/users/:userId/sessions
// Busca sessões de um usuário
router.get('/users/:userId/sessions', async (req, res) => {
  try {
    // Usuários podem ver suas próprias sessões
    if ((req.user as any)?.id !== req.params.userId && !['admin', 'system_admin', 'auditor'].includes((req.user as any)?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const sessions = await ActivityTrackingService.getUserSessions(req.params.userId, limit);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Erro ao buscar sessões do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar sessões do usuário'
    });
  }
});

// GET /api/activity-tracking/suspicious
// Busca atividades suspeitas
router.get('/suspicious', requireAuditPermission, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const activities = await ActivityTrackingService.getSuspiciousActivities(limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Erro ao buscar atividades suspeitas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar atividades suspeitas'
    });
  }
});

// GET /api/activity-tracking/failed-logins
// Busca tentativas de login falhadas
router.get('/failed-logins', requireAuditPermission, async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const failedLogins = await ActivityTrackingService.getFailedLogins(userId, limit);

    res.json({
      success: true,
      data: failedLogins
    });
  } catch (error) {
    console.error('Erro ao buscar logins falhados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar logins falhados'
    });
  }
});

// GET /api/activity-tracking/entities/:entityType/:entityId/audit-trail
// Obtém trilha de auditoria para uma entidade
router.get('/entities/:entityType/:entityId/audit-trail', requireAuditPermission, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const activities = await ActivityTrackingService.getEntityAuditTrail(entityType, entityId);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Erro ao buscar trilha de auditoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar trilha de auditoria'
    });
  }
});

// GET /api/activity-tracking/ip/:ipAddress
// Busca atividades por IP
router.get('/ip/:ipAddress', requireAuditPermission, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const activities = await ActivityTrackingService.getActivitiesByIP(req.params.ipAddress, limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Erro ao buscar atividades por IP:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar atividades por IP'
    });
  }
});

// GET /api/activity-tracking/export
// Exporta logs para CSV
router.get('/export', requireAuditPermission, async (req, res) => {
  try {
    const filter: ActivityFilter = {
      userId: req.query.userId as string,
      activityType: req.query.activityType as any,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
    };

    const csv = await ActivityTrackingService.exportToCSV(filter);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Erro ao exportar logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao exportar logs'
    });
  }
});

// GET /api/activity-tracking/compliance-report
// Obtém relatório de conformidade
router.get('/compliance-report', requireAuditPermission, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const report = await ActivityTrackingService.getComplianceReport(startDate, endDate);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de conformidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de conformidade'
    });
  }
});

// POST /api/activity-tracking/cleanup
// Limpa logs antigos (requer permissão especial)
router.post('/cleanup', requireAuditPermission, async (req, res) => {
  try {
    // Verificar permissão especial
    if ((req.user as any)?.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores do sistema podem limpar logs'
      });
    }

    const daysToKeep = req.body.daysToKeep || 90;
    const deletedCount = await ActivityTrackingService.cleanupOldLogs(daysToKeep);

    res.json({
      success: true,
      message: `${deletedCount} logs antigos removidos`,
      data: {
        deletedCount,
        daysToKeep
      }
    });
  } catch (error) {
    console.error('Erro ao limpar logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar logs'
    });
  }
});

// GET /api/activity-tracking/users/:userId/summary
// Obtém resumo de atividades do usuário
router.get('/users/:userId/summary', async (req, res) => {
  try {
    // Usuários podem ver seu próprio resumo
    if ((req.user as any)?.id !== req.params.userId && !['admin', 'system_admin', 'auditor'].includes((req.user as any)?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const summary = await ActivityTrackingService.getActivitySummary(req.params.userId, startDate, endDate);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Erro ao obter resumo de atividades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter resumo de atividades'
    });
  }
});

export default router; 