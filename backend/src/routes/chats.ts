import express from 'express';
import { authenticateToken as authMiddleware, authorizeRoles as requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get all chats for user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter chats by course ID
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Get chat by ID
 *     tags: [Chats]
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
 *         description: Chat found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Chat not found
 *       403:
 *         description: Not a participant in this chat
 */
router.get('/:id', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chats]
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
 *               - course_id
 *               - participants
 *             properties:
 *               name:
 *                 type: string
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of user IDs
 *     responses:
 *       201:
 *         description: Chat created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Invalid input
 */
router.post('/', requireRole('admin', 'teacher'), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/chats/{id}/messages:
 *   get:
 *     summary: Get messages for a chat
 *     tags: [Chats]
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
 *           default: 50
 *         description: Number of messages to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of messages to skip
 *     responses:
 *       200:
 *         description: Chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 *       404:
 *         description: Chat not found
 *       403:
 *         description: Not a participant in this chat
 */
router.get('/:id/messages', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/chats/{id}/messages:
 *   post:
 *     summary: Send a message to a chat
 *     tags: [Chats]
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
 *                 minLength: 1
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Chat not found
 *       403:
 *         description: Not a participant in this chat
 */
router.post('/:id/messages', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/chats/{id}/messages/{messageId}/read:
 *   post:
 *     summary: Mark a message as read
 *     tags: [Chats]
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
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Message marked as read
 *       404:
 *         description: Chat or message not found
 *       403:
 *         description: Not a participant in this chat
 */
router.post('/:id/messages/:messageId/read', async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/chats/{id}/participants:
 *   post:
 *     summary: Add participants to a chat
 *     tags: [Chats]
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
 *               - participants
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Participants added
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Chat not found
 *       403:
 *         description: Not authorized to modify this chat
 */
router.post('/:id/participants', requireRole('admin', 'teacher'), async (req, res) => {
  // Implementation will be added in the controller
});

export default router;
