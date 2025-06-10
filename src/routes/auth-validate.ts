import express from 'express';
import { AuthService } from '../services/AuthService';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';

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
    const { token, sessionId } = req.body;

    if (!token) {
      return res.status(401).json({
        valid: false,
        message: 'Token não fornecido'
      });
    }

    // 1. Validate JWT token
    let decoded;
    try {
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

    // 3. Validate Redis session if sessionId is provided
    if (sessionId) {
      const sessionData = await AuthService.validateSession(sessionId);
      if (!sessionData) {
        return res.status(401).json({
          valid: false,
          message: 'Sessão inválida ou expirada'
        });
      }

      // Verify session belongs to the same user
      if (sessionData.userId !== decoded.userId) {
        return res.status(401).json({
          valid: false,
          message: 'Sessão não pertence ao usuário'
        });
      }
    }

    // 4. Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        valid: false,
        message: 'Usuário inativo'
      });
    }

    // 5. Return user data without password
    const { password, ...userWithoutPassword } = user;

    return res.json({
      valid: true,
      user: {
        ...userWithoutPassword,
        role_name: user.role.name,
        institution_name: user.institution?.name,
        permissions: user.role.permissions
      }
    });

  } catch (error) {
    console.error('Erro ao validar sessão:', error);
    return res.status(500).json({
      valid: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router; 