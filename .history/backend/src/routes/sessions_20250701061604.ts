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
import {
  validateJWTSmart,
  requireRoleSmart
} from '../middleware/sessionMiddleware';
import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User';
import { getJwtSecret } from '../config/jwt';
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
router.get('/', requireAdmin, async (req, res) => {
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
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             basicLogin:
 *               summary: Login básico
 *               value:
 *                 email: "admin@portal.com"
 *                 password: "password123"
 *             webLogin:
 *               summary: Login com dispositivo web
 *               value:
 *                 email: "user@portal.com"
 *                 password: "password123"
 *                 deviceType: "web"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/login',

  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    body('remember').optional().isBoolean(),
  ],
  async (req: any, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password, remember = false } = req.body;

      // Busca e valida o usuário
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { email },
        relations: ['role', 'institution']
      });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Usuário inativo'
        });
      }

      // Cria sessão no Redis
      const { sessionId, refreshToken } = await SessionService.createSession(
        user, 
        req.clientInfo!,
        remember
      );

      // Gera JWT com sessionId
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.name.toUpperCase(),
          institutionId: user.institution_id,
          permissions: user.role?.permissions || [],
          sessionId
        },
        getJwtSecret(),
        { expiresIn: remember ? '7d' : '24h' }
      );

      return res.json({
        success: true,
        token,
        refreshToken,
        sessionId,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.name.toUpperCase(),
          institutionId: user.institution_id,
          permissions: user.role?.permissions || []
        },
        expiresAt: new Date(Date.now() + (remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()
      });
    } catch (error: any) {
      console.log('Erro no login:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', (req, res, next) => validateJWTSmart(req as any, res, next), async (req: any, res: express.Response) => {
  try {
    // Adiciona token à blacklist
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await SessionService.blacklistToken(token);
    }

    // Destrói sessão
    if (req.sessionId) {
      await SessionService.destroySession(req.sessionId);
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
 *                   example: "3 sessões foram finalizadas"
 *                 removedSessions:
 *                   type: number
 *                   example: 3
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout-all', (req, res, next) => validateJWTSmart(req as any, res, next), async (req: any, res: express.Response) => {
  try {
    const removedSessions = await SessionService.destroyAllUserSessions(req.user!.userId);

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
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00.000Z"
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Refresh token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

      // Valida refresh token
      const sessionId = await SessionService.validateRefreshToken(refreshToken);
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido'
        });
      }

      // Valida sessão
      const sessionData = await SessionService.validateSession(sessionId);
      if (!sessionData) {
        return res.status(401).json({
          success: false,
          message: 'Sessão inválida ou expirada'
        });
      }

      // Gera novo JWT
      const newToken = jwt.sign(
        {
          userId: sessionData.userId,
          email: sessionData.email,
          name: sessionData.name,
          role: sessionData.role,
          institutionId: sessionData.institutionId,
          permissions: sessionData.permissions,
          sessionId
        },
        getJwtSecret(),
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        token: newToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
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

/**
 * @swagger
 * /api/sessions/list:
 *   get:
 *     summary: Listar sessões ativas do usuário
 *     description: Retorna todas as sessões ativas do usuário atual com informações de dispositivo
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sessões ativas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sessions:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/SessionInfo'
 *                       - type: object
 *                         properties:
 *                           isCurrentSession:
 *                             type: boolean
 *                             description: Indica se é a sessão atual
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/list', (req, res, next) => validateJWTSmart(req as any, res, next), async (req: any, res: express.Response) => {
  try {
    const sessions = await SessionService.getUserSessions(req.user!.userId);
    
    // Marca a sessão atual
    const currentSessionId = req.sessionId;
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrentSession: session.sessionId === currentSessionId
    }));

    return res.json({
      success: true,
      sessions: sessionsWithCurrent
    });
  } catch (error) {
    console.log('Erro ao listar sessões:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/sessions/destroy/{sessionId}:
 *   delete:
 *     summary: Destruir sessão específica
 *     description: Remove uma sessão específica do usuário (não pode ser a sessão atual)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID da sessão a ser destruída
 *         schema:
 *           type: string
 *           example: "sess_123456789"
 *     responses:
 *       200:
 *         description: Sessão destruída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Sessão não encontrada ou não pertence ao usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/destroy/:sessionId', (req, res, next) => validateJWTSmart(req as any, res, next), async (req: any, res: express.Response) => {
  try {
    const { sessionId } = req.params;

    // Verifica se a sessão pertence ao usuário
    const sessionData = await SessionService.validateSession(sessionId, req.user!.userId);
    if (!sessionData || sessionData.userId !== req.user!.userId) {
      return res.status(404).json({
        success: false,
        message: 'Sessão não encontrada'
      });
    }

    const destroyed = await SessionService.destroySession(sessionId);

    if (destroyed) {
      return res.json({
        success: true,
        message: 'Sessão destruída com sucesso'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Sessão não encontrada'
      });
    }
  } catch (error) {
    console.log('Erro ao destruir sessão:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/sessions/stats:
 *   get:
 *     summary: Estatísticas de sessões (Admin)
 *     description: Retorna estatísticas gerais das sessões do sistema (apenas para administradores)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de sessões
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   $ref: '#/components/schemas/SessionStats'
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido ou sessão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats',
  (req: any, res: any, next: any) => validateJWTSmart(req as any, res, next),
  (req: any, res: any, next: any) => requireRoleSmart(['admin', 'SYSTEM_ADMIN'])(req as any, res, next),
  async (req: any, res: express.Response) => {
    try {
      const stats = await SessionService.getSessionStats();

      return res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.log('Erro ao obter estatísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/sessions/validate:
 *   get:
 *     summary: Validar sessão atual
 *     description: Valida se a sessão atual está ativa e retorna informações atualizadas
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessão válida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 session:
 *                   $ref: '#/components/schemas/SessionInfo'
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido ou sessão expirada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Sessão inválida ou expirada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/validate', (req, res, next) => validateJWTSmart(req as any, res, next), async (req: any, res: express.Response) => {
  try {
    return res.json({
      success: true,
      message: 'Sessão válida',
      user: {
        id: req.user!.userId,
        email: req.user!.email,
        name: req.user!.name,
        role: req.user!.role,
        institutionId: req.user!.institutionId,
        permissions: req.user!.permissions
      },
      sessionId: req.sessionId
    });
  } catch (error) {
    console.log('Erro na validação de sessão:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router; 