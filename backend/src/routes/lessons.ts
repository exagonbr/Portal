import express from 'express';
import { authenticateToken as authMiddleware, authorizeRoles as requireRole, authorizeInstitution as requireInstitution } from '../middleware/authMiddleware';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

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
router.post('/', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
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
router.put('/:id', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
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
router.delete('/:id', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
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
 *             required:
 *               - progress_percentage
 *             properties:
 *               progress_percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Progress updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProgress'
 *       400:
 *         description: Invalid input
 */
router.post('/:id/progress', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/lessons/reorder:
 *   post:
 *     summary: Reorder lessons in a module
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
 *               - module_id
 *               - lessonOrders
 *             properties:
 *               module_id:
 *                 type: string
 *                 format: uuid
 *               lessonOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - order
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     order:
 *                       type: integer
 *                       minimum: 0
 *     responses:
 *       200:
 *         description: Lessons reordered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/reorder', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

export default router;
