import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores podem acessar configurações'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/settings-simple:
 *   get:
 *     summary: Get simplified settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Simplified settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Simple settings - implementação pendente',
    data: {
      theme: 'light',
      language: 'pt-BR',
      notifications: true,
      autoSave: true
    }
  });
});

export default router;