import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import authService from '../services/AuthService';

const userRepository = new UserRepository();

class UserController extends BaseController<User> {
  constructor() {
    super(userRepository);
  }

  // Aqui você pode adicionar métodos específicos para o UserController, se necessário.
  // Por exemplo, um método para buscar usuários por role ou instituição.

  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    try {
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
    } catch (error: any) {
      console.error('Erro no login:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }

  public async toggleStatus(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `toggle status for user ${id}`, data: req.body });
  }

  public async changePassword(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `change password for user ${id}`, data: req.body });
  }

  public async getProfile(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `get profile for user ${id}` });
  }
}

export default new UserController();