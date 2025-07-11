import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { CreateUserDto, LoginDto } from '../dto/AuthDto';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: CreateUserDto = req.body;
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        deviceInfo: req.get('User-Agent') || 'unknown'
      };

      const result = await AuthService.register(userData, clientInfo);

      return res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          sessionId: result.sessionId,
          expires_at: result.expires_at
        },
        message: 'Usuário registrado com sucesso'
      });
    } catch (error: any) {
      if (error.message === 'Usuário já existe') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao registrar usuário',
        error: error.message
      });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginData: LoginDto = req.body;
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        deviceInfo: req.get('User-Agent') || 'unknown'
      };

      const result = await AuthService.login(loginData, clientInfo);

      return res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          sessionId: result.sessionId,
          expires_at: result.expires_at
        },
        message: 'Login realizado com sucesso'
      });
    } catch (error: any) {
      if (error.message === 'Credenciais inválidas' || error.message === 'Usuário inativo') {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer login',
        error: error.message
      });
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = (req as any).sessionId;
      const authUser = (req as any).user;
      
      if (!authUser?.userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const userData = await AuthService.getUserById(authUser.userId);
      
      if (!userData) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Atualiza atividade da sessão se disponível
      if (sessionId) {
        await AuthService.updateSessionActivity(sessionId);
      }

      // Remove senha da resposta
      const { password, ...userWithoutPassword } = userData;

      return res.json({
        success: true,
        data: {
          user: {
            ...userWithoutPassword,
            role_name: userData.role?.name,
            institution_name: userData.institution?.name
          }
        },
        message: 'Perfil do usuário recuperado com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar perfil do usuário',
        error: error.message
      });
    }
  }

  static async validateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID é obrigatório'
        });
      }

      const sessionData = await AuthService.validateSession(sessionId);

      if (!sessionData) {
        return res.status(401).json({
          success: false,
          message: 'Sessão inválida ou expirada'
        });
      }

      return res.json({
        success: true,
        data: {
          valid: true,
          session: sessionData
        },
        message: 'Sessão válida'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao validar sessão',
        error: error.message
      });
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const sessionId = (req as any).sessionId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const result = await AuthService.refreshToken(userId, sessionId);

      return res.json({
        success: true,
        data: {
          token: result.token,
          expires_at: result.expires_at
        },
        message: 'Token renovado com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao renovar token',
        error: error.message
      });
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = (req as any).sessionId || req.body.sessionId;

      if (sessionId) {
        await AuthService.logout(sessionId);
      }

      return res.json({
        success: true,
        data: null,
        message: 'Logout realizado com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer logout',
        error: error.message
      });
    }
  }

  static async logoutAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const removedCount = await AuthService.logoutAllDevices(userId);

      return res.json({
        success: true,
        data: {
          removedSessions: removedCount
        },
        message: `Logout realizado em ${removedCount} dispositivos`
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer logout de todos os dispositivos',
        error: error.message
      });
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      await AuthService.changePassword(userId, currentPassword, newPassword);

      return res.json({
        success: true,
        data: null,
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

  static async getUserSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const sessions = await AuthService.getUserSessions(userId);

      return res.json({
        success: true,
        data: sessions,
        message: 'Sessões do usuário recuperadas com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar sessões do usuário',
        error: error.message
      });
    }
  }
}
