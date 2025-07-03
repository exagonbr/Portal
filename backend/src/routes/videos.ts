import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validateJWT, requireRole } from '../middleware/auth';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// Middleware para verificar role de administrador/professor
const requireTeacherOrAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem gerenciar vídeos'
    });
  }
  
  next();
};

// Middleware para verificar instituição (implementação básica)
const requireInstitution = (req: any, res: any, next: any) => {
  const user = req.user;
  
  // Verificar se usuário tem institutionId
  if (!user.institutionId && user.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Usuário deve estar associado a uma instituição'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by module ID
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by course ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of videos
 */
router.get('/', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Videos list - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Get video by ID
 *     tags: [Videos]
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
 *         description: Video found
 *       404:
 *         description: Video not found
 */
router.get('/:id', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Video by ID - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Create a new video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - module_id
 *               - video_url
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               module_id:
 *                 type: string
 *                 format: uuid
 *               video_url:
 *                 type: string
 *               duration:
 *                 type: integer
 *               thumbnail_url:
 *                 type: string
 *               order_index:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Video created
 *       400:
 *         description: Invalid input
 */
router.post('/', requireTeacherOrAdmin, requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.status(201).json({
    success: true,
    message: 'Create video - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Update a video
 *     tags: [Videos]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               video_url:
 *                 type: string
 *               duration:
 *                 type: integer
 *               thumbnail_url:
 *                 type: string
 *               order_index:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Video updated
 *       404:
 *         description: Video not found
 */
router.put('/:id', requireTeacherOrAdmin, requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Update video - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Delete a video
 *     tags: [Videos]
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
 *         description: Video deleted
 *       404:
 *         description: Video not found
 */
router.delete('/:id', requireTeacherOrAdmin, requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Delete video - implementação pendente'
  });
});

/**
 * @swagger
 * /api/videos/upload:
 *   post:
 *     summary: Upload a video file
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *       400:
 *         description: Invalid file
 */
router.post('/upload', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  // Upload implementation would go here
  return res.status(501).json({
    success: false,
    message: 'Upload não implementado ainda'
  });
});

/**
 * @swagger
 * /api/videos/stream/{id}:
 *   get:
 *     summary: Stream video content
 *     tags: [Videos]
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
 *       206:
 *         description: Partial content (video stream)
 *       404:
 *         description: Video not found
 */
router.get('/:id/stream', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Video streaming - implementação pendente'
  });
});

/**
 * @swagger
 * /api/videos/{id}/thumbnail:
 *   get:
 *     summary: Get video thumbnail
 *     tags: [Videos]
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
 *         description: Video thumbnail
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Video or thumbnail not found
 */
router.get('/:id/thumbnail', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

export default router;
