import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/AuthService';
import { validateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new user account and returns an authentication token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               institution_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Por favor, forneça um email válido'),
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
    body('name').trim().notEmpty().withMessage('O nome é obrigatório'),
    body('role_id').isInt({ min: 1 }).withMessage('Selecione um tipo de usuário válido'),
    body('institution_id').optional().isInt({ min: 1 }).withMessage('Instituição inválida'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Por favor, corrija os erros no formulário',
          errors: errors.array().map(err => ({
            field: err.type === 'field' ? err.path : 'unknown',
            message: err.msg
          }))
        });
      }

      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        deviceInfo: 'web'
      };

      const result = await AuthService.register(req.body, clientInfo);

      return res.status(201).json({
        success: true,
        ...result,
        message: 'Conta criada com sucesso!',
      });
    } catch (error: any) {
      if (error.message === 'Usuário já existe') {
        return res.status(409).json({
          success: false,
          message: 'Este email já está cadastrado. Por favor, use outro email ou faça login.',
        });
      }

      console.error('Erro no registro:', error);
      return res.status(500).json({
        success: false,
        message: 'Não foi possível criar sua conta. Por favor, tente novamente mais tarde.',
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticates a user and returns a token
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Por favor, forneça um email válido'),
    body('password').notEmpty().withMessage('A senha é obrigatória'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Por favor, corrija os erros no formulário',
          errors: errors.array().map(err => ({
            field: err.type === 'field' ? err.path : 'unknown',
            message: err.msg
          }))
        });
      }

      const { email, password } = req.body;
      
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        deviceInfo: 'web'
      };
      
      const result = await AuthService.login({ email, password }, clientInfo);

      return res.json({
        success: true,
        ...result,
        message: 'Login realizado com sucesso!',
      });
    } catch (error: any) {
      if (error.message === 'Credenciais inválidas') {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos. Por favor, verifique suas credenciais.',
        });
      }

      if (error.message === 'Usuário inativo') {
        return res.status(401).json({
          success: false,
          message: 'Sua conta está inativa. Entre em contato com o administrador do sistema.',
        });
      }

      if (error.message === 'Conta bloqueada') {
        return res.status(401).json({
          success: false,
          message: 'Sua conta está bloqueada por motivos de segurança. Entre em contato com o suporte.',
        });
      }

      console.error('Erro no login:', error);
      return res.status(500).json({
        success: false,
        message: 'Não foi possível realizar o login. Por favor, tente novamente mais tarde.',
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile
 *     description: Returns the profile of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', validateJWT, async (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt((req as any).user?.userId);
    const sessionId = (req as any).sessionId;
    
    if (!userId || isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Sessão inválida. Por favor, faça login novamente.'
      });
    }

    const user = await AuthService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado. Por favor, faça login novamente.'
      });
    }

    if (sessionId) {
      await AuthService.updateSessionActivity(sessionId);
    }

    const { password, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Perfil carregado com sucesso!',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Não foi possível carregar seu perfil. Por favor, tente novamente mais tarde.',
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Logs out the current user and invalidates the session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', validateJWT, async (req: express.Request, res: express.Response) => {
  try {
    const sessionId = (req as any).sessionId || req.body.sessionId;

    if (sessionId) {
      await AuthService.logout(sessionId);
    }

    return res.json({
      success: true,
      message: 'Logout realizado com sucesso! Até logo!'
    });
  } catch (error: any) {
    console.error('Erro no logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Não foi possível realizar o logout. Por favor, tente novamente.',
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh authentication token
 *     description: Refreshes the authentication token for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 expires_at:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.post('/refresh', validateJWT, async (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt((req as any).user?.userId);
    const sessionId = (req as any).sessionId;

    if (!userId || isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const result = await AuthService.refreshToken(userId, sessionId);

    return res.json({
      success: true,
      token: result.token,
      expires_at: result.expires_at
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao renovar token',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Change user password
 *     description: Changes the password for the current user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input or current password incorrect
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/change-password',
  validateJWT,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = parseInt((req as any).user?.userId);
      const { currentPassword, newPassword } = req.body;

      if (!userId || isNaN(userId)) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      await AuthService.changePassword(userId, currentPassword, newPassword);

      return res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error: any) {
      if (error.message === 'Senha atual incorreta') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao alterar senha',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get user sessions
 *     description: Returns all active sessions for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/sessions', validateJWT, async (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt((req as any).user?.userId);

    if (!userId || isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const sessions = await AuthService.getUserSessions(userId);

    return res.json({
      success: true,
      sessions
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar sessões do usuário',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout from all devices
 *     description: Logs out the user from all devices by invalidating all sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout-all', validateJWT, async (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt((req as any).user?.userId);

    if (!userId || isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const destroyedSessions = await AuthService.logoutAllDevices(userId);

    return res.json({
      success: true,
      message: `${destroyedSessions} sessões encerradas`,
      destroyedSessions
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao encerrar todas as sessões',
      error: error.message
    });
  }
});

export default router;
