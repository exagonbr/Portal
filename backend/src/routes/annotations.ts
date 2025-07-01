import express from 'express';
import {
  optimizedAuthMiddleware,
  requirePermission
} from '../middleware/optimizedAuth.middleware';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(optimizedAuthMiddleware);

/**
 * @swagger
 * /api/annotations:
 *   get:
 *     summary: Get all annotations
 *     tags: [Annotations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: book_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter annotations by book ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter annotations by user ID
 *     responses:
 *       200:
 *         description: List of annotations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Annotation'
 *       401:
 *         description: Unauthorized
 */
router.get('/', requirePermission('content:read'), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/annotations/{id}:
 *   get:
 *     summary: Get annotation by ID
 *     tags: [Annotations]
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
 *         description: Annotation found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annotation'
 *       404:
 *         description: Annotation not found
 */
router.get('/:id', requirePermission('content:read'), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/annotations:
 *   post:
 *     summary: Create a new annotation
 *     tags: [Annotations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - page_number
 *               - book_id
 *             properties:
 *               content:
 *                 type: string
 *               page_number:
 *                 type: integer
 *                 minimum: 1
 *               book_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Annotation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annotation'
 *       400:
 *         description: Invalid input
 */
router.post('/', requirePermission('content:create'), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/annotations/{id}:
 *   put:
 *     summary: Update an annotation
 *     tags: [Annotations]
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
 *               content:
 *                 type: string
 *               page_number:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Annotation updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annotation'
 *       404:
 *         description: Annotation not found
 */
router.put('/:id', requirePermission('content:update'), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/annotations/{id}:
 *   delete:
 *     summary: Delete an annotation
 *     tags: [Annotations]
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
 *         description: Annotation deleted
 *       404:
 *         description: Annotation not found
 */
router.delete('/:id', requirePermission('content:delete'), async (req, res) => {
  // Implementation will be added in the controller
});

export default router;
