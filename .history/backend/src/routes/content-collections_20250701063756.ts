import express from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

/**
 * @swagger
 * /api/content-collections:
 *   get:
 *     summary: Get all content collections
 *     tags: [Content Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter collections by subject
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter collections by tag
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter collections by creator
 *     responses:
 *       200:
 *         description: List of content collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContentCollection'
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    data: [],
    message: 'Content collections endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/content-collections/{id}:
 *   get:
 *     summary: Get content collection by ID
 *     tags: [Content Collections]
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
 *         description: Content collection found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentCollection'
 *       404:
 *         description: Collection not found
 */
router.get('/:id', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    data: null,
    message: 'Content collection by ID endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/content-collections:
 *   post:
 *     summary: Create a new content collection
 *     tags: [Content Collections]
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
 *               - subject
 *             properties:
 *               name:
 *                 type: string
 *               synopsis:
 *                 type: string
 *               cover_image:
 *                 type: string
 *               support_material:
 *                 type: string
 *               total_duration:
 *                 type: integer
 *                 description: Total duration in seconds
 *               subject:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Collection created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentCollection'
 *       400:
 *         description: Invalid input
 */
router.post('/', async (req, res) => {
  const user = (req as any).user;
  
  // Verificar se é SYSTEM_ADMIN ou TEACHER
  if (!['SYSTEM_ADMIN', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem criar coleções de conteúdo'
    });
  }

  // Implementation will be added in the controller
  return res.status(201).json({
    success: true,
    data: null,
    message: 'Create content collection endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/content-collections/{id}:
 *   put:
 *     summary: Update a content collection
 *     tags: [Content Collections]
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
 *               synopsis:
 *                 type: string
 *               cover_image:
 *                 type: string
 *               support_material:
 *                 type: string
 *               total_duration:
 *                 type: integer
 *               subject:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Collection updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentCollection'
 *       404:
 *         description: Collection not found
 *       403:
 *         description: Not authorized to edit this collection
 */
router.put('/:id', async (req, res) => {
  const user = (req as any).user;
  
  // Verificar se é SYSTEM_ADMIN ou TEACHER
  if (!['SYSTEM_ADMIN', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem atualizar coleções de conteúdo'
    });
  }

  // Implementation will be added in the controller
  return res.json({
    success: true,
    data: null,
    message: 'Update content collection endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/content-collections/{id}:
 *   delete:
 *     summary: Delete a content collection
 *     tags: [Content Collections]
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
 *         description: Collection deleted
 *       404:
 *         description: Collection not found
 *       403:
 *         description: Not authorized to delete this collection
 */
router.delete('/:id', async (req, res) => {
  const user = (req as any).user;
  
  // Verificar se é SYSTEM_ADMIN ou TEACHER
  if (!['SYSTEM_ADMIN', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem deletar coleções de conteúdo'
    });
  }

  // Implementation will be added in the controller
  return res.json({
    success: true,
    message: 'Delete content collection endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/content-collections/{id}/videos:
 *   get:
 *     summary: Get videos in a content collection
 *     tags: [Content Collections]
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
 *         description: List of videos in collection
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 *       404:
 *         description: Collection not found
 */
router.get('/:id/videos', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    data: [],
    message: 'Collection videos endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/content-collections/{id}/videos:
 *   post:
 *     summary: Add video to content collection
 *     tags: [Content Collections]
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
 *             required:
 *               - title
 *               - video_url
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               video_url:
 *                 type: string
 *               duration:
 *                 type: integer
 *               order_index:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Video added to collection
 *       404:
 *         description: Collection not found
 *       403:
 *         description: Not authorized to modify this collection
 */
router.post('/:id/videos', async (req, res) => {
  const user = (req as any).user;
  
  // Verificar se é SYSTEM_ADMIN ou TEACHER
  if (!['SYSTEM_ADMIN', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem adicionar vídeos'
    });
  }

  // Implementation will be added in the controller
  res.status(201).json({
    success: true,
    data: null,
    message: 'Add video to collection endpoint - implementation pending'
  });
});

export default router;
