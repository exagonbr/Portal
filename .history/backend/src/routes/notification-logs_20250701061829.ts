import { Router } from 'express';
import { notificationLogService } from '../services/NotificationLogService';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores podem acessar logs de notificação'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/notification-logs:
 *   get:
 *     summary: Get notification logs
 *     tags: [NotificationLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notification logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificationLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Notification logs - implementação pendente',
    data: []
  });
});

/**
 * GET /api/notification-logs/:id
 * Busca um log específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const log = await notificationLogService.findById(id);

    if (!log) {
      return res.status(404).json({ message: 'Log não encontrado' });
    }

    return res.json(log);
  } catch (error) {
    console.log('Erro ao buscar log de notificação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/notification-logs/stats
 * Retorna estatísticas dos logs de notificação
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    const stats = await notificationLogService.getStats(
      type as any,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(stats);
  } catch (error) {
    console.log('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/notification-logs/by-recipient/:recipient
 * Busca logs por destinatário
 */
router.get('/by-recipient/:recipient', async (req, res) => {
  try {
    const { recipient } = req.params;
    const { type } = req.query;

    const logs = await notificationLogService.findByRecipient(
      recipient,
      type as any
    );

    res.json(logs);
  } catch (error) {
    console.log('Erro ao buscar logs por destinatário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/notification-logs/by-token/:token
 * Busca logs por token de verificação
 */
router.get('/by-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const logs = await notificationLogService.findByVerificationToken(token);

    res.json(logs);
  } catch (error) {
    console.log('Erro ao buscar logs por token:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/notification-logs/:id/mark-opened
 * Marca um email como aberto
 */
router.put('/:id/mark-opened', async (req, res) => {
  try {
    const { id } = req.params;

    const log = await notificationLogService.markAsOpened(id);

    if (!log) {
      return res.status(404).json({ message: 'Log não encontrado' });
    }

    return res.json({ message: 'Email marcado como aberto', log });
  } catch (error) {
    console.log('Erro ao marcar email como aberto:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/notification-logs/:id/mark-clicked
 * Marca um email como clicado
 */
router.put('/:id/mark-clicked', async (req, res) => {
  try {
    const { id } = req.params;

    const log = await notificationLogService.markAsClicked(id);

    if (!log) {
      return res.status(404).json({ message: 'Log não encontrado' });
    }

    return res.json({ message: 'Email marcado como clicado', log });
  } catch (error) {
    console.log('Erro ao marcar email como clicado:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/notification-logs/cleanup
 * Remove logs antigos (apenas para admins)
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const { days = 90 } = req.query;

    const deletedCount = await notificationLogService.cleanupOldLogs(
      parseInt(days as string)
    );

    res.json({ 
      message: `${deletedCount} logs antigos foram removidos`,
      deletedCount 
    });
  } catch (error) {
    console.log('Erro ao limpar logs antigos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;