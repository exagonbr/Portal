import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { User } from '../entities/User';

class AuthController {
  public async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as User;
      const token = AuthService.generateToken(user);
      
      // Usar URL de produção ou fallback para desenvolvimento
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      console.log('🔐 Google OAuth: Redirecionando usuário após autenticação');
      console.log('👤 Usuário:', user.email);
      console.log('🌐 Frontend URL:', frontendUrl);
      
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('❌ Erro durante autenticação Google:', error);
      
      // Redirecionar para página de erro em caso de falha
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/login?error=google_auth_failed`);
    }
  }
}

export default new AuthController();
