import express from 'express';
import { authenticateToken as authMiddleware, authorizeRoles as requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

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
 *       - in: query
 *         name: module_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter quizzes by module ID
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
 *               - passing_score
 *               - course_id
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               time_limit:
 *                 type: integer
 *                 description: Time limit in minutes
 *               passing_score:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               attempts:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *               is_graded:
 *                 type: boolean
 *                 default: true
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               module_id:
 *                 type: string
 *                 format: uuid
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
router.post('/', requireRole('admin', 'teacher'), async (req, res) => {
  // Implementation will be added in the controller
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
 *               time_limit:
 *                 type: integer
 *               passing_score:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               attempts:
 *                 type: integer
 *                 minimum: 1
 *               is_graded:
 *                 type: boolean
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
router.put('/:id', requireRole('admin', 'teacher'), async (req, res) => {
  // Implementation will be added in the controller
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
router.delete('/:id', requireRole('admin', 'teacher'), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/quizzes/{id}/questions:
 *   get:
 *     summary: Get questions for a quiz
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
 *         description: Quiz questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       404:
 *         description: Quiz not found
 */
router.get('/:id/questions', async (req, res) => {
  // Implementation will be added in the controller
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
 *         description: Maximum attempts reached or quiz not available
 *       404:
 *         description: Quiz not found
 */
router.post('/:id/attempts', requireRole('student'), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/quizzes/{id}/attempts/{attemptId}/submit:
 *   post:
 *     summary: Submit quiz answers
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
 *                 type: object
 *                 description: Question ID to answer mapping
 *     responses:
 *       200:
 *         description: Quiz submitted and graded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttempt'
 *       400:
 *         description: Invalid answers or attempt already completed
 *       404:
 *         description: Quiz or attempt not found
 */
router.post('/:id/attempts/:attemptId/submit', requireRole('student'), async (req, res) => {
  // Implementation will be added in the controller
});

export default router;
