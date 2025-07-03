import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole, requireInstitution } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Get all modules
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter modules by course ID
 *     responses:
 *       200:
 *         description: List of modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/modules/{id}:
 *   get:
 *     summary: Get module by ID
 *     tags: [Modules]
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
 *         description: Module found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       404:
 *         description: Module not found
 */
router.get('/:id', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Create a new module
 *     tags: [Modules]
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
 *               - course_id
 *               - order
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Module created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       400:
 *         description: Invalid input
 */
router.post('/', requireRole(['admin', 'teacher']), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/modules/{id}:
 *   put:
 *     summary: Update a module
 *     tags: [Modules]
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
 *               order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Module updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       404:
 *         description: Module not found
 */
router.put('/:id', requireRole(['admin', 'teacher']), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/modules/{id}:
 *   delete:
 *     summary: Delete a module
 *     tags: [Modules]
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
 *         description: Module deleted
 *       404:
 *         description: Module not found
 */
router.delete('/:id', requireRole(['admin', 'teacher']), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/modules/{id}/lessons:
 *   get:
 *     summary: Get all lessons for a module
 *     tags: [Modules, Lessons]
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
 *         description: List of lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Module not found
 */
router.get('/:id/lessons', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/modules/reorder:
 *   post:
 *     summary: Reorder modules in a course
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - moduleOrders
 *             properties:
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               moduleOrders:
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
 *         description: Modules reordered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/reorder', requireRole(['admin', 'teacher']), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

export default router;
