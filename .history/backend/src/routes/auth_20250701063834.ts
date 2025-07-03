import { Router, Request, Response } from 'express';
import passport from 'passport';
import AuthController from '../controllers/AuthController';
import AuthService from '../services/AuthService';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

/**
 * 🔐 ROTAS DE AUTENTICAÇÃO UNIFICADAS
 * 
 * POST /login - Fazer login e obter tokens
 * POST /refresh - Renovar access token
 * POST /logout - Fazer logout
 * GET /me - Obter dados do usuário atual
 */

/**
 * 🎯 LOGIN
 * Valida credenciais e retorna tokens JWT
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validar dados de entrada
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Realizar login
    const result = await AuthService.login(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Configurar cookie para refresh token (httpOnly)
    res.cookie('refreshToken', result.data!.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    // Retornar apenas access token no body
    return res.json({
      success: true,
      data: {
        accessToken: result.data!.accessToken,
        user: result.data!.user
      }
    });

  } catch (error) {
    console.error('❌ Erro na rota de login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * 🔄 REFRESH
 * Renova access token usando refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    // Obter refresh token do cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token não encontrado'
      });
    }

    // Renovar tokens
    const result = await AuthService.refresh(refreshToken);

    if (!result.success) {
      // Limpar cookie se refresh token inválido
      res.clearCookie('refreshToken');
      return res.status(401).json(result);
    }

    // Atualizar cookie com novo refresh token
    res.cookie('refreshToken', result.data!.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    // Retornar novo access token
    return res.json({
      success: true,
      data: {
        accessToken: result.data!.accessToken
      }
    });

  } catch (error) {
    console.error('❌ Erro na rota de refresh:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * 🚪 LOGOUT
 * Invalida tokens e limpa cookies
 */
router.post('/logout', requireAuth, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.substring(7) || '';

    // Realizar logout (invalidar tokens)
    const result = await AuthService.logout(accessToken);

    // Limpar cookie de refresh token
    res.clearCookie('refreshToken');

    return res.json(result);

  } catch (error) {
    console.error('❌ Erro na rota de logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * 👤 ME
 * Retorna dados do usuário autenticado
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          institutionId: user.institutionId
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro na rota /me:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * ✅ VALIDATE
 * Valida se o token atual é válido
 */
router.get('/validate', requireAuth, async (req: Request, res: Response) => {
  try {
    // Se chegou até aqui, o token é válido (passou pelo requireAuth)
    return res.json({
      success: true,
      message: 'Token válido'
    });

  } catch (error) {
    console.error('❌ Erro na rota de validação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  AuthController.googleCallback
);

export default router;
