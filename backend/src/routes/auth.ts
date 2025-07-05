import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Rotas de Autenticação PÚBLICAS
router.post('/login', AuthController.login);
router.post('/refresh_token', AuthController.refreshToken);

// Rotas otimizadas PÚBLICAS (aliases para compatibilidade com frontend)
router.post('/optimized/login', AuthController.login);
router.post('/optimized/refresh_token', AuthController.refreshToken);

// Rotas PROTEGIDAS
router.post('/logout', requireAuth, AuthController.logout);
router.post('/optimized/logout', requireAuth, AuthController.logout);

// Rota para obter dados do usuário autenticado
router.get('/me', requireAuth, AuthController.getMe);

// Rota para validar o token
router.get('/validate', requireAuth, AuthController.validateToken);
router.get('/optimized/validate', requireAuth, AuthController.validateToken);

export default router;