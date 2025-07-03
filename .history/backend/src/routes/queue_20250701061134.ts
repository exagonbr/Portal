import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
// import { QueueService } from '../services/queueService';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);
// const queueService = QueueService.getInstance();

// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores podem gerenciar a fila'
    });
  }
  
  next();
};

// Endpoint /next removido - não é necessário no sistema atual

/**
 * @swagger
 * /api/queue/stats:
 *   get:
 *     summary: Get queue statistics
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queue statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: number
 *                     processing:
 *                       type: number
 *                     completed:
 *                       type: number
 *                     failed:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Queue stats - implementação pendente',
    data: {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    }
  });
});

/**
 * @swagger
 * /api/queue/pause:
 *   post:
 *     summary: Pause queue processing
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queue paused successfully
 */
router.post('/pause', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Queue pause - implementação pendente'
  });
});

/**
 * @swagger
 * /api/queue/resume:
 *   post:
 *     summary: Resume queue processing
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queue resumed successfully
 */
router.post('/resume', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Queue resume - implementação pendente'
  });
});

export default router; 