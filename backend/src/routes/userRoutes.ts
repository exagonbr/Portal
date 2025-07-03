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
      message: 'Acesso negado - apenas administradores podem gerenciar usuários'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/user-routes:
 *   get:
 *     summary: Get all user routes
 *     tags: [UserRoutes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user routes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserRoute'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'User routes list - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/user-routes/permissions/{userId}:
 *   get:
 *     summary: Get user permissions
 *     tags: [UserRoutes]
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
 *         description: User permissions
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
 *                     type: string
 */
router.get('/permissions/:userId', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'User permissions - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/user-routes/permissions/{userId}:
 *   put:
 *     summary: Update user permissions
 *     tags: [UserRoutes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Permissions updated
 */
router.put('/permissions/:userId', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Update user permissions - implementação pendente'
  });
});

/**
 * @swagger
 * /api/user-routes/access-history/{userId}:
 *   get:
 *     summary: Get user access history
 *     tags: [UserRoutes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: User access history
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
 *                     $ref: '#/components/schemas/AccessLog'
 */
router.get('/access-history/:userId', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'User access history - implementação pendente',
    data: []
  });
});

export default router;