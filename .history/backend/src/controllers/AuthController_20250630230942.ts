import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { User } from '../entities/User';

class AuthController {
  public async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.user;
      if (!payload || !payload.id) {
        return res.status(401).redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=auth_failed`);
      }

      const user = await AuthService.getUserById(payload.id);
      if (!user) {
        return res.status(404).redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=user_not_found`);
      }

      // Assumindo que o objeto User tem a relação de Role carregada
      const role = user.role;
      if (!role) {
        return res.status(500).redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=role_not_found`);
      }

      const token = AuthService.generateToken(user, role);
      
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
