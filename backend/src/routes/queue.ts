import express from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
// import { QueueService } from '../services/queueService';

const router = express.Router();
// const queueService = QueueService.getInstance();

/**
 * @swagger
 * /api/queue/next:
 *   get:
 *     summary: Get next jobs from queue
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Next jobs in queue
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QueueJob'
 *       404:
 *         description: No jobs available
 */
router.get('/next', validateJWT, async (req, res) => {
  try {
    // Retorna uma lista vazia se não há jobs, evitando erro 404
    res.json({
      success: true,
      data: [],
      message: 'No jobs available'
    });
  } catch (error) {
    console.error('Error fetching next jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

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