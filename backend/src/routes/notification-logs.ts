import { Router } from 'express';
import { notificationLogService } from '../services/NotificationLogService';
import { validateJWTSimple } from '../middleware/sessionMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(validateJWTSimple);

/**
 * GET /api/notification-logs
 * Lista logs de notificação com paginação e filtros
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type,
      status,
      recipient,
      userId
    } = req.query;

    const result = await notificationLogService.list({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      type: type as any,
      status: status as any,
      recipient: recipient as string,
      userId: userId as string
    });

    return res.json(result);
  } catch (error) {
    console.log('Erro ao listar logs de notificação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
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