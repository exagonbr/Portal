import express from 'express';
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
      message: 'Acesso negado - apenas administradores podem gerenciar shows de TV'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/tv-show-complete:
 *   get:
 *     summary: Get all TV show completion data
 *     tags: [TVShows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of TV show completion data
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
 *                     $ref: '#/components/schemas/TVShowComplete'
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'TV show completion data - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/tv-show-complete/user/{userId}:
 *   get:
 *     summary: Get TV show completion data for a specific user
 *     tags: [TVShows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User TV show completion data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TVShowComplete'
 */
router.get('/user/:userId', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'User TV show completion - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/tv-show-complete/mark-complete:
 *   post:
 *     summary: Mark a TV show as complete for the current user
 *     tags: [TVShows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - showId
 *               - seasonNumber
 *               - episodeNumber
 *             properties:
 *               showId:
 *                 type: string
 *                 format: uuid
 *               seasonNumber:
 *                 type: integer
 *               episodeNumber:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: TV show marked as complete
 */
router.post('/mark-complete', async (req, res) => {
  // Implementation will be added in the controller
  res.status(201).json({
    success: true,
    message: 'Mark TV show complete - implementação pendente'
  });
});

/**
 * @swagger
 * /api/tv-show-complete/stats:
 *   get:
 *     summary: Get TV show completion statistics (admin only)
 *     tags: [TVShows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: TV show completion statistics
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
 *                     totalShows:
 *                       type: integer
 *                     completedShows:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *                     topRatedShows:
 *                       type: array
 */
router.get('/stats', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'TV show stats - implementação pendente',
    data: {
      totalShows: 0,
      completedShows: 0,
      averageRating: 0,
      topRatedShows: []
    }
  });
});

export default router; 