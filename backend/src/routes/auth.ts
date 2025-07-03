import { Router } from 'express';
import authController from '../controllers/AuthController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

/**
 * 🔐 ROTAS DE AUTENTICAÇÃO UNIFICADAS
 *
 * POST /login - Fazer login e obter tokens
 * POST /refresh_token - Renovar access token
 * POST /logout - Fazer logout
 * GET /me - Obter dados do usuário atual
 * GET /validate - Validar o token atual
 */

// Rotas principais de autenticação
router.post('/login', authController.login);
router.post('/refresh_token', authController.refreshToken);
router.post('/logout', authController.logout);

// Rota para obter dados do usuário autenticado
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

// Rota para validar o token
router.get('/validate', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Token válido.' });
});

export default router;
