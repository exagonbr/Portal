import express from 'express';
import { authenticateToken as authMiddleware, authorizeRoles as requireRole, authorizeInstitution as requireInstitution } from '../middleware/authMiddleware';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

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
 *         name: course_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter videos by course ID
 *     responses:
 *       200:
 *         description: List of videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 */
router.get('/:id', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - course_id
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Video created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       400:
 *         description: Invalid input
 */
router.post('/', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 */
router.put('/:id', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
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
router.delete('/:id', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/videos/{id}/stream:
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
 *       - in: header
 *         name: Range
 *         schema:
 *           type: string
 *         description: Bytes range header for partial content
 *     responses:
 *       206:
 *         description: Partial Content
 *         headers:
 *           Content-Range:
 *             schema:
 *               type: string
 *             description: Content range info
 *           Content-Length:
 *             schema:
 *               type: integer
 *             description: Content length
 *           Content-Type:
 *             schema:
 *               type: string
 *             description: Video content type
 *         content:
 *           video/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Video not found
 */
router.get('/:id/stream', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
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
