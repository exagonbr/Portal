import express from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter books by course ID
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    data: [],
    message: 'Books endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
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
 *         description: Book found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get('/:id', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    data: null,
    message: 'Book by ID endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
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
 *               - author
 *               - isbn
 *               - course_id
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Book created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid input
 */
router.post('/', async (req, res) => {
  const user = (req as any).user;
  
  // Verificar se é SYSTEM_ADMIN ou TEACHER
  if (!['SYSTEM_ADMIN', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem criar livros'
    });
  }

  // Implementation will be added in the controller
  res.status(201).json({
    success: true,
    data: null,
    message: 'Create book endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
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
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Book updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.put('/:id', async (req, res) => {
  const user = (req as any).user;
  
  // Verificar se é SYSTEM_ADMIN ou TEACHER
  if (!['SYSTEM_ADMIN', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem atualizar livros'
    });
  }

  // Implementation will be added in the controller
  res.json({
    success: true,
    data: null,
    message: 'Update book endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
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
 *         description: Book deleted
 *       404:
 *         description: Book not found
 */
router.delete('/:id', async (req, res) => {
  const user = (req as any).user;
  
  // Verificar se é SYSTEM_ADMIN ou TEACHER
  if (!['SYSTEM_ADMIN', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem deletar livros'
    });
  }

  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Delete book endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/books/{id}/annotations:
 *   get:
 *     summary: Get all annotations for a book
 *     tags: [Books, Annotations]
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
 *         description: Book annotations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Annotation'
 *       404:
 *         description: Book not found
 */
router.get('/:id/annotations', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    data: [],
    message: 'Book annotations endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/books/{id}/highlights:
 *   get:
 *     summary: Get all highlights for a book
 *     tags: [Books, Highlights]
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
 *         description: List of highlights
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Highlight'
 *       404:
 *         description: Book not found
 */
router.get('/:id/highlights', requirePermission('content:read'), async (req, res) => {
  // Implementation will be added in the controller
});

export default router;
