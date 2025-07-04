import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Rotas de Autenticação
router.post('/login', AuthController.login);
router.post('/refresh_token', AuthController.refreshToken);
router.post('/logout', requireAuth, AuthController.logout);

// Rota para obter dados do usuário autenticado
router.get('/me', requireAuth, (req: any, res) => {
  res.json({ success: true, data: { user: req.user } });
});

// Rota para validar o token
router.get('/validate', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Token válido.' });
});

export default router;