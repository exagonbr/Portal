import { Request, Response } from 'express';
import authService from '../services/AuthService';
import { AuthenticatedUser } from '../types/auth.types';
import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';

/**
 * 🎮 CONTROLLER DE AUTENTICAÇÃO UNIFICADO
 *
 * ✅ Endpoints para Login, Refresh, Logout
 * ✅ Utiliza o AuthService centralizado
 * ✅ Envia Refresh Token em cookie httpOnly
 */
class AuthController {

  /**
   * 🎯 POST /login
   * Autentica o usuário e retorna tokens.
   */
  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    const result = await authService.login(email, password);

    if (!result.success || !result.data) {
      return res.status(401).json({ success: false, message: result.message || 'Credenciais inválidas.' });
    }

    // Envia o refresh token em um cookie seguro
    authService.sendRefreshToken(res, result.data.refreshToken);

    // Retorna o access token e os dados do usuário no corpo da resposta
    return res.json({
      success: true,
      data: {
        accessToken: result.data.accessToken,
        user: result.data.user,
      },
    });
  }

  /**
   * 🔄 POST /refresh_token
   * Gera um novo access token a partir do refresh token.
   */
  public async refreshToken(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies.jid;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token não encontrado.' });
    }

    const result = await authService.refresh(refreshToken);

    if (!result.success || !result.data) {
      return res.status(401).json({ success: false, message: result.message || 'Falha ao renovar o token.' });
    }

    return res.json({
      success: true,
      data: {
        accessToken: result.data.accessToken,
      },
    });
  }

  /**
   * 🚪 POST /logout
   * Limpa o cookie do refresh token.
   */
  public async logout(req: Request, res: Response): Promise<Response> {
    authService.clearRefreshToken(res);
    return res.json({ success: true, message: 'Logout realizado com sucesso.' });
  }

  public async getMe(req: Request, res: Response): Promise<Response> {
    return res.json({ success: true, data: { user: req.user } });
  }

  public async validateToken(req: Request, res: Response): Promise<Response> {
    return res.json({ success: true, message: 'Token válido.' });
  }

  /**
   * 🔐 POST /google-signin
   * Autentica ou cria usuário com dados do Google OAuth
   */
  public async googleSignin(req: Request, res: Response): Promise<Response> {
    try {
      const { email, name, googleId, image } = req.body;

      if (!email || !name || !googleId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados do Google OAuth são obrigatórios.' 
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const roleRepository = AppDataSource.getRepository(Role);
      
      // Buscar usuário existente por email
      let user = await userRepository.findOne({
        where: { email },
        relations: ['role']
      });

      if (!user) {
        // Criar novo usuário se não existir
        user = new User();
        user.email = email;
        user.fullName = name;
        user.googleId = googleId;
        user.profileImage = image;
        user.enabled = true;
        user.emailVerified = true; // Google OAuth já verifica email
        
        // Definir role padrão como STUDENT
        const defaultRole = await roleRepository.findOne({
          where: { name: 'STUDENT' }
        });
        
        if (defaultRole) {
          user.role = defaultRole;
        }

        await userRepository.save(user);
      } else {
        // Atualizar dados do Google se usuário já existe
        user.googleId = googleId;
        if (image) {
          user.profileImage = image;
        }
        await userRepository.save(user);
      }

      // Gerar tokens
      const result = await authService.generateTokensForUser(user);
      
      if (!result.success || !result.data) {
        return res.status(500).json({ 
          success: false, 
          message: 'Erro ao gerar tokens de autenticação.' 
        });
      }

      // Enviar refresh token em cookie
      authService.sendRefreshToken(res, result.data.refreshToken);

      return res.json({
        success: true,
        data: {
          accessToken: result.data.accessToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role?.name || 'STUDENT',
            image: user.profileImage
          }
        }
      });

    } catch (error) {
      console.error('Erro no Google signin:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor.' 
      });
    }
  }

  public async googleCallback(req: Request, res: Response): Promise<Response> {
    try {
      // O req.user pode ser AuthenticatedUser (do Passport) ou User (do requireAuth)
      const payload = req.user as AuthenticatedUser;
      
      if (!payload || !payload.id) {
        res.status(401).redirect(`${process.env.FRONTEND_URL || 'https://portal.sabercon.com.br'}/auth/login?error=auth_failed`);
        return res.end();
      }

      // Buscar usuário no banco de dados
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: payload.id },
        relations: ['role']
      });

      if (!user) {
        res.status(404).redirect(`${process.env.FRONTEND_URL || 'https://portal.sabercon.com.br'}/auth/login?error=user_not_found`);
        return res.end();
      }

      // Gerar token JWT para o usuário autenticado via Google OAuth
      const token = this.generateTokenForUser(user);
      if (!token) {
        res.status(500).redirect(`${process.env.FRONTEND_URL || 'https://portal.sabercon.com.br'}/auth/login?error=token_generation_failed`);
        return res.end();
      }
      
      // Usar URL de produção ou fallback para desenvolvimento
      const frontendUrl = process.env.FRONTEND_URL || 'https://portal.sabercon.com.br';
      
      console.log('🔐 Google OAuth: Redirecionando usuário após autenticação');
      console.log('👤 Usuário:', user.email);
      console.log('🌐 Frontend URL:', frontendUrl);
      
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      return res.end();
    } catch (error) {
      console.log('❌ Erro durante autenticação Google:', error);
      
      // Redirecionar para página de erro em caso de falha
      const frontendUrl = 'https://portal.sabercon.com.br';
      res.redirect(`${frontendUrl}/auth/login?error=google_auth_failed`);
      return res.end();
    }
  }

  /**
   * Gera um token JWT para um usuário específico
   */
  private generateTokenForUser(user: User): string | null {
    try {
      const secret = JWT_CONFIG.SECRET;
      if (!secret) {
        console.error('JWT_SECRET is not configured.');
        return null;
      }

      const payload = {
        id: user.id.toString(),
        email: user.email,
        name: user.fullName,
        role: user.role?.name || 'TEACHER',
        institutionId: user.institutionId?.toString(),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'access',
      };

      return jwt.sign(payload, secret, {
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: JWT_CONFIG.ALGORITHM as jwt.Algorithm,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
      });
    } catch (error) {
      console.error('Erro ao gerar token para usuário:', error);
      return null;
    }
  }
}

export default new AuthController();
