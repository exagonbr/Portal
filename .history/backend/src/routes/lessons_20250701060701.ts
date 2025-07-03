import express from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// Middleware para verificar role de administrador/professor
const requireTeacherOrAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem gerenciar lições'
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
 * /api/lessons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter lessons by module ID
 *     responses:
 *       200:
 *         description: List of lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Lessons list - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lessons]
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
 *         description: Lesson found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson not found
 */
router.get('/:id', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Lesson by ID - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lessons]
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
 *               - content
 *               - module_id
 *               - order
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               module_id:
 *                 type: string
 *                 format: uuid
 *               order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Lesson created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Invalid input
 */
router.post('/', requireTeacherOrAdmin, requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.status(201).json({
    success: true,
    message: 'Create lesson - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Update a lesson
 *     tags: [Lessons]
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
 *               content:
 *                 type: string
 *               order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Lesson updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson not found
 */
router.put('/:id', requireTeacherOrAdmin, requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Update lesson - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
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
 *         description: Lesson deleted
 *       404:
 *         description: Lesson not found
 */
router.delete('/:id', requireTeacherOrAdmin, requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Delete lesson - implementação pendente'
  });
});

/**
 * @swagger
 * /api/lessons/{id}/progress:
 *   post:
 *     summary: Update user progress for a lesson
 *     tags: [Lessons, Progress]
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
 *               completed:
 *                 type: boolean
 *               progress_percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.post('/:id/progress', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Update lesson progress - implementação pendente'
  });
});

/**
 * @swagger
 * /api/lessons/reorder:
 *   post:
 *     summary: Reorder lessons within a module
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessons
 *             properties:
 *               lessons:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Lessons reordered successfully
 */
router.post('/reorder', requireTeacherOrAdmin, requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Reorder lessons - implementação pendente'
  });
});

export default router;
