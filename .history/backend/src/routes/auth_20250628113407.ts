import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth';
import { OptimizedAuthService } from '../services/OptimizedAuthService';
import { authMiddleware } from '../middleware/auth.middleware';

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

      return res.status(201).json(result);
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
 *     summary: Login user - Simplified
 *     description: Authenticates a user and returns a token (no rate limiting)
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
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    console.log('🔐 Nova requisição de login recebida na rota ANTIGA');
    console.log('🔍 DEBUG ROTA ANTIGA - Dados recebidos:', {
      body: req.body,
      contentType: req.headers['content-type'],
      bodyType: typeof req.body
    });
    
    // Validação básica sem middleware complexo
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    console.log(`🔐 Tentativa de login para: ${email}`);
    
    // Usar OptimizedAuthService para melhor performance
    const result = await OptimizedAuthService.login(email, password);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message || 'Credenciais inválidas'
      });
    }

    console.log(`✅ Login bem-sucedido para: ${email}`);

    // Usar o token JWT já gerado pelo OptimizedAuthService
    const token = result.token;

    // Resposta simplificada
    return res.status(200).json({
      success: true,
      token,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role_slug,
        institution_id: result.user.institution_id,
        permissions: result.user.permissions || []
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    
    // Tratamento de erros específicos
    if (error.message?.includes('Credenciais inválidas') || 
        error.message?.includes('Invalid credentials') ||
        error.message?.includes('User not found') ||
        error.message?.includes('Usuário não encontrado')) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    if (error.message?.includes('Usuário inativo') || 
        error.message?.includes('User inactive')) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.'
      });
    }

    // Erro genérico
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Tente novamente.'
    });
  }
});

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
router.get('/me', authMiddleware, async (req: express.Request, res: express.Response) => {
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
router.post('/logout', authMiddleware, async (req: express.Request, res: express.Response) => {
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

/**
 * @swagger
 * /api/auth/validate-session:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Validate token and session
 *     description: Validates both JWT token and Redis session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token and session are valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid token or session
 *       500:
 *         description: Internal server error
 */
router.post('/validate-session', async (req: express.Request, res: express.Response) => {
  try {
    const { token } = req.body;
    const sessionId = req.body.sessionId; // Optional sessionId for future Redis integration

    if (!token) {
      return res.status(401).json({
        valid: false,
        message: 'Token não fornecido'
      });
    }

    // 1. Validate JWT token
    let decoded;
    try {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return res.status(401).json({
        valid: false,
        message: 'Token JWT inválido'
      });
    }

    // 2. Get user from database
    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        valid: false,
        message: 'Usuário não encontrado'
      });
    }

    // 3. Optional: Validate Redis session if sessionId is provided and SessionService is available
    if (sessionId) {
      try {
        const sessionModule = await import('../services/SessionService');
        const SessionService = sessionModule.SessionService;
        
        const sessionValid = await SessionService.validateSession(sessionId);
        if (!sessionValid) {
          return res.status(401).json({
            valid: false,
            message: 'Sessão inválida ou expirada'
          });
        }
      } catch (importError) {
        // SessionService not available, continue with JWT-only validation
        console.log('SessionService não disponível, validando apenas JWT');
      }
    }

    return res.json({
      valid: true,
      user: user
    });

  } catch (error) {
    console.error('Erro ao validar sessão:', error);
    return res.status(500).json({
      valid: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh authentication token
 *     description: Generates a new JWT using a valid refresh token
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
 *               sessionId:
 *                 type: string
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.post('/refresh-token', async (req: express.Request, res: express.Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token não fornecido'
      });
    }

    // Importação dinâmica do SessionService para evitar problemas de dependência circular
    let SessionService;
    try {
      const sessionModule = await import('../services/SessionService');
      SessionService = sessionModule.SessionService;
    } catch (importError) {
      console.error('SessionService não disponível:', importError);
      return res.status(500).json({
        success: false,
        message: 'Serviço de sessão não disponível'
      });
    }

    // Valida refresh token
    const validatedSessionId = await SessionService.validateRefreshToken(refreshToken);
    if (!validatedSessionId) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido ou expirado'
      });
    }

    // Valida sessão
    const sessionData = await SessionService.validateSession(validatedSessionId);
    if (!sessionData) {
      return res.status(401).json({
        success: false,
        message: 'Sessão inválida ou expirada'
      });
    }

    // Gera novo JWT
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';
    
    const newToken = jwt.sign(
      {
        userId: sessionData.userId,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role,
        institutionId: sessionData.institutionId,
        permissions: sessionData.permissions,
        sessionId: validatedSessionId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Atualizar atividade da sessão
    await SessionService.updateSessionActivity(validatedSessionId);

    return res.json({
      success: true,
      data: {
        token: newToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('Erro no refresh token:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/test:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Test endpoint
 *     description: Simple test endpoint to verify server is working
 *     responses:
 *       200:
 *         description: Server is working
 */
router.get('/test', (req: express.Request, res: express.Response) => {
  console.log('🧪 Rota de teste acessada');
  return res.status(200).json({
    success: true,
    message: 'Servidor funcionando corretamente',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl
  });
});

/**
 * @swagger
 * /api/auth/login-simple:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Ultra-simple login
 *     description: Minimal login endpoint without any middleware
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login-simple', (req: express.Request, res: express.Response) => {
  console.log('🔐 Login simples acessado');
  
  const { email, password } = req.body;
  
  // Resposta de teste
  return res.status(200).json({
    success: true,
    message: 'Endpoint de login funcionando',
    received: { email: email ? 'presente' : 'ausente', password: password ? 'presente' : 'ausente' },
    timestamp: new Date().toISOString()
  });
});

export default router;
