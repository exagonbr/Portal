import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth';
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
 *               - role
 *               - institution_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, student]
 *               institution_id:
 *                 type: string
 *                 format: uuid
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
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roleId:
 *                       type: string
 *                     roleName:
 *                       type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     institutionId:
 *                       type: string
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('role').isIn(['admin', 'teacher', 'student']),
    body('institution_id').isUUID(),
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

      const result = await AuthService.register(req.body);

      return res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error registering user',
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
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roleId:
 *                       type: string
 *                     roleName:
 *                       type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     institutionId:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
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

      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      return res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (
        error.message === 'Invalid credentials' ||
        error.message === 'Usuário não encontrado ou inativo'
      ) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      console.error('Erro no login:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro no login: ' + error.message,
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
 *     summary: Get current user
 *     description: Returns the currently authenticated user's information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.get('/me', validateJWT, async (req: express.Request, res: express.Response) => {
  try {
    const user = await AuthService.getUserById(req.user!.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user information',
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
 *     description: Invalidates the current user session and token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout realizado com sucesso"
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.post('/logout', validateJWT, async (req: express.Request, res: express.Response) => {
  try {
    // Importação dinâmica do SessionService para evitar problemas de dependência circular
    let SessionService;
    try {
      const sessionModule = await import('../services/SessionService');
      SessionService = sessionModule.SessionService;
    } catch (importError) {
      // Se o SessionService não estiver disponível, apenas retorna sucesso
      console.log('SessionService não disponível, fazendo logout simples');
    }

    if (SessionService) {
      // Adiciona token à blacklist se SessionService estiver disponível
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          await SessionService.blacklistToken(token);
        } catch (blacklistError) {
          console.log('Erro ao adicionar token à blacklist:', blacklistError);
        }
      }

      // Destrói sessão se sessionId estiver disponível
      const sessionId = (req as any).sessionId || (req.user as any)?.sessionId;
      if (sessionId) {
        try {
          await SessionService.destroySession(sessionId);
        } catch (sessionError) {
          console.log('Erro ao destruir sessão:', sessionError);
        }
      }
    }

    return res.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao fazer logout',
    });
  }
});

export default router;
