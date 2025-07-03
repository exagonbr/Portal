import express from 'express';
import { authenticateToken as authMiddleware, authorizeRoles as requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /api/forum/threads:
 *   get:
 *     summary: Get all forum threads
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter threads by course ID
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter threads by tag
 *       - in: query
 *         name: pinned
 *         schema:
 *           type: boolean
 *         description: Filter pinned threads
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of threads to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of threads to skip
 *     responses:
 *       200:
 *         description: List of forum threads
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ForumThread'
 *       401:
 *         description: Unauthorized
 */
router.get('/threads', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/forum/threads/{id}:
 *   get:
 *     summary: Get forum thread by ID
 *     tags: [Forum]
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
 *         description: Forum thread found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForumThread'
 *       404:
 *         description: Thread not found
 */
router.get('/threads/:id', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/forum/threads:
 *   post:
 *     summary: Create a new forum thread
 *     tags: [Forum]
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
 *               - course_id
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *               content:
 *                 type: string
 *                 minLength: 10
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Thread created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForumThread'
 *       400:
 *         description: Invalid input
 */
router.post('/threads', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/forum/threads/{id}:
 *   put:
 *     summary: Update a forum thread
 *     tags: [Forum]
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
 *                 minLength: 5
 *               content:
 *                 type: string
 *                 minLength: 10
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Thread updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForumThread'
 *       404:
 *         description: Thread not found
 *       403:
 *         description: Not authorized to edit this thread
 */
router.put('/threads/:id', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/forum/threads/{id}:
 *   delete:
 *     summary: Delete a forum thread
 *     tags: [Forum]
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
 *         description: Thread deleted
 *       404:
 *         description: Thread not found
 *       403:
 *         description: Not authorized to delete this thread
 */
router.delete('/threads/:id', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/forum/threads/{id}/pin:
 *   post:
 *     summary: Pin/unpin a forum thread
 *     tags: [Forum]
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
 *               - pinned
 *             properties:
 *               pinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Thread pin status updated
 *       404:
 *         description: Thread not found
 *       403:
 *         description: Not authorized to pin threads
 */
router.post('/threads/:id/pin', requireRole('admin', 'teacher'), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/forum/threads/{id}/lock:
 *   post:
 *     summary: Lock/unlock a forum thread
 *     tags: [Forum]
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
 *               - locked
 *             properties:
 *               locked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Thread lock status updated
 *       404:
 *         description: Thread not found
 *       403:
 *         description: Not authorized to lock threads
 */
router.post('/threads/:id/lock', requireRole('admin', 'teacher'), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/forum/threads/{id}/replies:
 *   get:
 *     summary: Get replies for a forum thread
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of replies to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of replies to skip
 *     responses:
 *       200:
 *         description: Thread replies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ForumReply'
 *       404:
 *         description: Thread not found
 */
router.get('/threads/:id/replies', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/forum/threads/{id}/replies:
 *   post:
 *     summary: Reply to a forum thread
 *     tags: [Forum]
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 5
 *               parent_reply_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of parent reply for nested replies
 *     responses:
 *       201:
 *         description: Reply created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForumReply'
 *       400:
 *         description: Invalid input or thread is locked
 *       404:
 *         description: Thread not found
 */
router.post('/threads/:id/replies', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/forum/replies/{id}:
 *   put:
 *     summary: Update a forum reply
 *     tags: [Forum]
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 5
 *     responses:
 *       200:
 *         description: Reply updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForumReply'
 *       404:
 *         description: Reply not found
 *       403:
 *         description: Not authorized to edit this reply
 */
router.put('/replies/:id', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/forum/replies/{id}:
 *   delete:
 *     summary: Delete a forum reply
 *     tags: [Forum]
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
 *         description: Reply deleted
 *       404:
 *         description: Reply not found
 *       403:
 *         description: Not authorized to delete this reply
 */
router.delete('/replies/:id', async (req, res) => {
  // Implementation will be added in the controller
});

export default router;
