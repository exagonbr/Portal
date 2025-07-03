import * as express from 'express';
import { body, validationResult } from 'express-validator';
import { OptimizedAuthController } from '../controllers/OptimizedAuthController';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

/**
 * @swagger
 * /api/auth/optimized/login:
 *   post:
 *     tags:
 *       - Authentication Optimized
 *     summary: Login otimizado com JWT padrão
 *     description: Realiza login com consulta unificada e JWT padrão mundial
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@exemplo.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Access token JWT (1 hora)
 *                     refreshToken:
 *                       type: string
 *                       description: Refresh token JWT (7 dias)
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role_slug:
 *                           type: string
 *                         permissions:
 *                           type: array
 *                           items:
 *                             type: string
 *                     expiresIn:
 *                       type: number
 *                       description: Tempo de expiração em segundos
 *                 message:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email deve ser válido'),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Senha é obrigatória')
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      // Verificar validações
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array(),
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      await OptimizedAuthController.login(req, res);
    } catch (error) {
      console.log('Erro na rota de login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/optimized/refresh:
 *   post:
 *     tags:
 *       - Authentication Optimized
 *     summary: Renovar access token
 *     description: Renova o access token usando o refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token válido
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *       401:
 *         description: Refresh token inválido ou expirado
 */
router.post('/refresh', OptimizedAuthController.refreshToken);

/**
 * @swagger
 * /api/auth/optimized/profile:
 *   get:
 *     tags:
 *       - Authentication Optimized
 *     summary: Obter perfil do usuário
 *     description: Retorna dados completos do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtido com sucesso
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/profile', (req: any, res: any, next: any) => optimizedAuthMiddleware(req as any, res, next), (req: any, res: any) => OptimizedAuthController.getProfile(req, res));

/**
 * @swagger
 * /api/auth/optimized/validate:
 *   get:
 *     tags:
 *       - Authentication Optimized
 *     summary: Validar token atual
 *     description: Verifica se o token atual é válido
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/validate', (req: any, res: any, next: any) => optimizedAuthMiddleware(req as any, res, next), (req: any, res: any) => OptimizedAuthController.validateToken(req, res));

/**
 * @swagger
 * /api/auth/optimized/permission/{permission}:
 *   get:
 *     tags:
 *       - Authentication Optimized
 *     summary: Verificar permissão específica
 *     description: Verifica se o usuário tem uma permissão específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da permissão a verificar
 *     responses:
 *       200:
 *         description: Verificação realizada
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/permission/:permission', (req: any, res: any, next: any) => optimizedAuthMiddleware(req as any, res, next), (req: any, res: any) => OptimizedAuthController.hasPermission(req, res));

/**
 * @swagger
 * /api/auth/optimized/logout:
 *   post:
 *     tags:
 *       - Authentication Optimized
 *     summary: Logout
 *     description: Realiza logout do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
router.post('/logout', (req: any, res: any, next: any) => optimizedAuthMiddleware(req as any, res, next), (req: any, res: any) => OptimizedAuthController.logout(req, res));

/**
 * Rota de teste para debug do login
 */
router.post('/test-login', (req: express.Request, res: express.Response) => {
  console.log('🧪 TEST LOGIN - Headers:', req.headers);
  console.log('🧪 TEST LOGIN - Body:', req.body);
  console.log('🧪 TEST LOGIN - Raw Body:', req.body);
  
  res.json({
    success: true,
    message: 'Teste de login - dados recebidos',
    data: {
      headers: req.headers,
      body: req.body,
      contentType: req.headers['content-type'],
      bodyType: typeof req.body
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Rota de status da API de autenticação
 */
router.get('/status', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'API de autenticação otimizada funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router; 