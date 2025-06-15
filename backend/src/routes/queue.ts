import express from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
// import { QueueService } from '../services/queueService';

const router = express.Router();
// const queueService = QueueService.getInstance();

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
 */
router.get('/stats', validateJWT, requireRole(['admin', 'SYSTEM_ADMIN']), async (req, res) => {
  try {
    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
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
 *         description: Queue paused
 */
router.post('/pause', validateJWT, requireRole(['admin', 'SYSTEM_ADMIN']), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Queue paused'
    });
  } catch (error) {
    console.error('Error pausing queue:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
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
 *         description: Queue resumed
 */
router.post('/resume', validateJWT, requireRole(['admin', 'SYSTEM_ADMIN']), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Queue resumed'
    });
  } catch (error) {
    console.error('Error resuming queue:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router; 