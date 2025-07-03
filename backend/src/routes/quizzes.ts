import express from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// Middleware para verificar role de administrador/professor
const requireTeacherOrAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem gerenciar quizzes'
    });
  }
  
  next();
};

// Middleware para verificar role de estudante
const requireStudent = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['STUDENT'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas estudantes podem realizar quizzes'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter quizzes by course ID
 *     responses:
 *       200:
 *         description: List of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Quizzes list - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quizzes]
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
 *         description: Quiz found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 */
router.get('/:id', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Quiz by ID - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
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
 *               - description
 *               - course_id
 *               - questions
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/QuizQuestion'
 *     responses:
 *       201:
 *         description: Quiz created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       400:
 *         description: Invalid input
 */
router.post('/', requireTeacherOrAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.status(201).json({
    success: true,
    message: 'Create quiz - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Update a quiz
 *     tags: [Quizzes]
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
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/QuizQuestion'
 *     responses:
 *       200:
 *         description: Quiz updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 */
router.put('/:id', requireTeacherOrAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Update quiz - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete a quiz
 *     tags: [Quizzes]
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
 *         description: Quiz deleted
 *       404:
 *         description: Quiz not found
 */
router.delete('/:id', requireTeacherOrAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Delete quiz - implementação pendente'
  });
});

/**
 * @swagger
 * /api/quizzes/{id}/attempts:
 *   post:
 *     summary: Start a quiz attempt
 *     tags: [Quizzes]
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
 *       201:
 *         description: Quiz attempt started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttempt'
 *       400:
 *         description: Invalid input
 */
router.post('/:id/attempts', requireStudent, async (req, res) => {
  // Implementation will be added in the controller
  res.status(201).json({
    success: true,
    message: 'Start quiz attempt - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/quizzes/{id}/attempts/{attemptId}/submit:
 *   post:
 *     summary: Submit quiz attempt
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: attemptId
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
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question_id:
 *                       type: string
 *                       format: uuid
 *                     answer:
 *                       type: string
 *     responses:
 *       200:
 *         description: Quiz attempt submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResult'
 *       400:
 *         description: Invalid input
 */
router.post('/:id/attempts/:attemptId/submit', requireStudent, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Submit quiz attempt - implementação pendente',
    data: null
  });
});

export default router;
