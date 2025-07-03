import express from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

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
 * /api/highlights:
 *   get:
 *     summary: Get all highlights
 *     tags: [Highlights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: book_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter highlights by book ID
 *     responses:
 *       200:
 *         description: List of highlights
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Highlight'
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Highlights list - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/highlights/{id}:
 *   get:
 *     summary: Get highlight by ID
 *     tags: [Highlights]
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
 *         description: Highlight found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Highlight'
 *       404:
 *         description: Highlight not found
 */
router.get('/:id', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Highlight by ID - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/highlights:
 *   post:
 *     summary: Create a new highlight
 *     tags: [Highlights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - book_id
 *               - position
 *             properties:
 *               text:
 *                 type: string
 *               book_id:
 *                 type: string
 *                 format: uuid
 *               position:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: number
 *                   end:
 *                     type: number
 *               color:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Highlight created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Highlight'
 *       400:
 *         description: Invalid input
 */
router.post('/', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.status(201).json({
    success: true,
    message: 'Create highlight - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/highlights/{id}:
 *   put:
 *     summary: Update a highlight
 *     tags: [Highlights]
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
 *               text:
 *                 type: string
 *               color:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Highlight updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Highlight'
 *       404:
 *         description: Highlight not found
 */
router.put('/:id', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Update highlight - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/highlights/{id}:
 *   delete:
 *     summary: Delete a highlight
 *     tags: [Highlights]
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
 *         description: Highlight deleted
 *       404:
 *         description: Highlight not found
 */
router.delete('/:id', requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Delete highlight - implementação pendente'
  });
});

export default router;
