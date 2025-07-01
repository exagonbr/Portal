import express from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// Middleware para verificar role de administrador do sistema
const requireSystemAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (user.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores do sistema podem gerenciar coleções de vídeo'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/video-collections:
 *   get:
 *     summary: Get all video collections
 *     tags: [VideoCollections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of video collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VideoCollection'
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Video collections list - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/video-collections/manage:
 *   get:
 *     summary: Get video collections for management (admin only)
 *     tags: [VideoCollections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Video collections for management
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VideoCollection'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/manage', requireSystemAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Video collections management - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/video-collections/manage:
 *   post:
 *     summary: Create a new video collection (admin only)
 *     tags: [VideoCollections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Video collection created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoCollection'
 *       400:
 *         description: Invalid input
 */
router.post('/manage', requireSystemAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.status(201).json({
    success: true,
    message: 'Create video collection - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/video-collections/manage/{id}:
 *   put:
 *     summary: Update a video collection (admin only)
 *     tags: [VideoCollections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Video collection updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoCollection'
 *       404:
 *         description: Video collection not found
 */
router.put('/manage/:id', requireSystemAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Update video collection - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/video-collections/manage/{id}:
 *   delete:
 *     summary: Delete a video collection (admin only)
 *     tags: [VideoCollections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Video collection deleted
 *       404:
 *         description: Video collection not found
 */
router.delete('/manage/:id', requireSystemAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Delete video collection - implementação pendente'
  });
});

export default router; 