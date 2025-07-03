import { Request, Response } from 'express';
import { OptimizedAuthService } from '../services/OptimizedAuthService';
import { AuthenticatedRequest } from '../middleware/optimizedAuth.middleware';

export class OptimizedAuthController {
  /**
   * Login otimizado com JWT padrão
   */
  static async login(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { email, password } = req.body;

      // Debug: Log dos dados recebidos
      console.log('🔍 DEBUG - Dados recebidos:', {
        body: req.body,
        email: email,
        password: password ? '[PRESENTE]' : '[AUSENTE]',
        emailType: typeof email,
        passwordType: typeof password
      });

      // Validações básicas
      if (!email || !password) {
        console.log('❌ Validação falhou - Email ou senha ausentes');
        res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios',
          code: 'MISSING_CREDENTIALS'
        });
        return;
      }

      // Realizar login
      const result = await OptimizedAuthService.login(email, password);

      const duration = Date.now() - startTime;
      console.log(`✅ Login realizado em ${duration}ms para: ${email}`);

      res.status(200).json({
        success: true,
        data: {
          token: result.token,
          refreshToken: result.refreshToken,
          user: result.user,
          expiresIn: result.expiresIn
        },
        message: result.message
      });

    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ Erro no login (${duration}ms):`, error.message);

      if (error.message === 'Credenciais inválidas' || error.message === 'Email inválido') {
        res.status(401).json({
          success: false,
          message: error.message,
          code: 'INVALID_CREDENTIALS'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Renovar access token usando refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório',
          code: 'MISSING_REFRESH_TOKEN'
        });
        return;
      }

      const result = await OptimizedAuthService.refreshAccessToken(refreshToken);

      if (!result) {
        res.status(401).json({
          success: false,
          message: 'Refresh token inválido ou expirado',
          code: 'INVALID_REFRESH_TOKEN'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          token: result.token,
          expiresIn: result.expiresIn
        },
        message: 'Token renovado com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao renovar token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Obter perfil do usuário autenticado
   */
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const user = await OptimizedAuthService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user },
        message: 'Perfil obtido com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Validar token atual
   */
  static async validateToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Token inválido',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          valid: true,
          user: {
            userId: req.user.userId,
            email: req.user.email || '',
            name: req.user.name || '',
            role: req.user.role,
            permissions: req.user.permissions || [],
            institutionId: req.user.institutionId || ''
          }
        },
        message: 'Token válido'
      });

    } catch (error: any) {
      console.error('Erro ao validar token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Verificar permissão específica
   */
  static async hasPermission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const { permission } = req.params;

      if (!permission) {
        res.status(400).json({
          success: false,
          message: 'Permissão não especificada',
          code: 'MISSING_PERMISSION'
        });
        return;
      }

      const hasPermission = await OptimizedAuthService.hasPermission(req.user.userId, permission);

      res.status(200).json({
        success: true,
        data: {
          hasPermission,
          permission,
          userPermissions: req.user.permissions || []
        },
        message: 'Verificação de permissão realizada'
      });

    } catch (error: any) {
      console.error('Erro ao verificar permissão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Logout (invalidar tokens do lado do cliente)
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Note: Com JWT stateless, o logout é principalmente do lado do cliente
      // Aqui podemos registrar o logout ou implementar uma blacklist se necessário
      
      if (req.user) {
        console.log(`🔓 Logout realizado para usuário: ${req.user.email || 'N/A'} (${req.user.userId})`);
      }

      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });

    } catch (error: any) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
} 