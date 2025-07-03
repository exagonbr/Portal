/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: 📱 Gerenciamento de sessões Redis e JWT
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { SessionService } from '../services/SessionService';
import { JWT_CONFIG } from '../config/jwt';
import { requireAuth } from '../middleware/requireAuth';
import { Users } from '../entities/Users';
import { AppDataSource } from '../config/typeorm.config';

const router = express.Router();
const sessionService = new SessionService();
const userRepository = AppDataSource.getRepository(Users);

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO (exceto para login e refresh)
// Login e refresh não precisam de autenticação prévia
router.use('/logout', requireAuth);
router.use('/logout-all', requireAuth);
router.use('/list', requireAuth);
router.use('/destroy', requireAuth);
router.use('/stats', requireAuth);
router.use('/validate', requireAuth);
router.use('/my', requireAuth);
router.use('/user', requireAuth);
router.use('/cleanup', requireAuth);

// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores podem gerenciar sessões'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all active sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Sessions list - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/sessions/my:
 *   get:
 *     summary: Get current user sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 */
router.get('/my', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'My sessions - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/sessions/{sessionId}:
 *   delete:
 *     summary: Terminate a specific session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session terminated
 *       404:
 *         description: Session not found
 */
router.delete('/:sessionId', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Terminate session - implementação pendente'
  });
});

/**
 * @swagger
 * /api/sessions/user/{userId}:
 *   get:
 *     summary: Get sessions for a specific user (admin only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 */
router.get('/user/:userId', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'User sessions - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/sessions/user/{userId}/terminate-all:
 *   post:
 *     summary: Terminate all sessions for a user (admin only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: All user sessions terminated
 */
router.post('/user/:userId/terminate-all', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Terminate all user sessions - implementação pendente'
  });
});

/**
 * @swagger
 * /api/sessions/cleanup:
 *   post:
 *     summary: Cleanup expired sessions (admin only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired sessions cleaned up
 */
router.post('/cleanup', requireAdmin, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Cleanup expired sessions - implementação pendente'
  });
});

/**
 * @swagger
 * /api/sessions/login:
 *   post:
 *     summary: Realizar login e criar sessão
 *     description: Autentica o usuário e cria uma nova sessão Redis com suporte a múltiplos dispositivos
 *     tags: [Sessions]
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
 *               remember:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Dados de entrada inválidos
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    const user = await userRepository.findOne({ 
      where: { email },
      relations: ['role']
    });

    if (!user || !user.enabled) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas ou usuário inativo'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Cria nova sessão
    const { sessionId, refreshToken } = await sessionService.createSession(
      user,
      {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      },
      req.body.remember || false
    );

    // Gera access token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role?.name,
        permissions: user.role?.permissions || [],
        institutionId: user.institutionId,
        sessionId
      },
      JWT_CONFIG.SECRET!,
      {
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: JWT_CONFIG.ALGORITHM,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE
      }
    );

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role?.name,
          permissions: user.role?.permissions || [],
          institutionId: user.institutionId
        }
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/sessions/logout:
 *   post:
 *     summary: Realizar logout e destruir sessão
 *     description: Destrói a sessão atual do usuário e adiciona o token à blacklist
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/logout', async (req: any, res: express.Response) => {
  try {
    // Adiciona token à blacklist (se disponível)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        await sessionService.blacklistToken(token);
      } catch (error) {
        console.log('Aviso: Erro ao adicionar token à blacklist:', error);
      }
    }

    // Destrói sessão (se disponível)
    if (req.sessionId) {
      try {
        await sessionService.destroySession(req.sessionId);
      } catch (error) {
        console.log('Aviso: Erro ao destruir sessão:', error);
      }
    }

    return res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.log('Erro no logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/sessions/logout-all:
 *   post:
 *     summary: Logout de todos os dispositivos
 *     description: Destrói todas as sessões ativas do usuário em todos os dispositivos
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout de todos os dispositivos realizado com sucesso
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/logout-all', async (req: any, res: express.Response) => {
  try {
    let removedSessions = 0;
    
    try {
      removedSessions = await sessionService.destroyAllUserSessions(req.user.userId);
    } catch (error) {
      console.log('Aviso: Erro ao destruir sessões do usuário:', error);
    }

    return res.json({
      success: true,
      message: `${removedSessions} sessões foram finalizadas`,
      removedSessions
    });
  } catch (error) {
    console.log('Erro no logout-all:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/sessions/refresh:
 *   post:
 *     summary: Atualizar token usando refresh token
 *     description: Gera um novo JWT usando um refresh token válido
 *     tags: [Sessions]
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
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *       400:
 *         description: Dados de entrada inválidos
 *       401:
 *         description: Refresh token inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/refresh',
  [body('refreshToken').notEmpty()],
  async (req: any, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { refreshToken } = req.body;

      // Valida refresh token (se disponível)
      let sessionId = null;
      let sessionData = null;
      
      try {
        sessionId = await sessionService.validateRefreshToken(refreshToken);
        if (!sessionId) {
          return res.status(401).json({
            success: false,
            message: 'Refresh token inválido'
          });
        }

        // Valida sessão
        sessionData = await sessionService.validateSession(sessionId);
        if (!sessionData) {
          return res.status(401).json({
            success: false,
            message: 'Sessão inválida ou expirada'
          });
        }
      } catch (error) {
        console.log('Aviso: Erro ao validar refresh token:', error);
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido'
        });
      }

      // Gera novo JWT
      const jwtPayload = {
        userId: sessionData.userId,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role,
        institutionId: sessionData.institutionId,
        permissions: sessionData.permissions,
        sessionId
      };
      
      if (!JWT_CONFIG.SECRET) {
        throw new Error('JWT_SECRET is not configured.');
      }

      const jwtOptions: jwt.SignOptions = { 
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
        algorithm: JWT_CONFIG.ALGORITHM
      };
      
      const newToken = jwt.sign(jwtPayload, JWT_CONFIG.SECRET, jwtOptions);

      return res.json({
        success: true,
        token: newToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      console.log('Erro no refresh:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

export default router;
