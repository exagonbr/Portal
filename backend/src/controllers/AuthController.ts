import { Request, Response } from 'express';
import AuthService from '../services/AuthService';

class AuthController {
  public async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.user;
      if (!payload || !payload.id) {
        return res.status(401).redirect(`${process.env.FRONTEND_URL || 'https://portal.sabercon.com.br'}/auth/login?error=auth_failed`);
      }

      const user = await AuthService.getUserById(payload.id);
      if (!user) {
        return res.status(404).redirect(`${process.env.FRONTEND_URL || 'https://portal.sabercon.com.br'}/auth/login?error=user_not_found`);
      }

      // Gerar token para o usuário autenticado via Google OAuth
      const token = await AuthService.generateTokenForUser(user);
      if (!token) {
        return res.status(500).redirect(`${process.env.FRONTEND_URL || 'https://portal.sabercon.com.br'}/auth/login?error=token_generation_failed`);
      }
      
      // Usar URL de produção ou fallback para desenvolvimento
      const frontendUrl = process.env.FRONTEND_URL || 'https://portal.sabercon.com.br';
      
      console.log('🔐 Google OAuth: Redirecionando usuário após autenticação');
      console.log('👤 Usuário:', user.email);
      console.log('🌐 Frontend URL:', frontendUrl);
      
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.log('❌ Erro durante autenticação Google:', error);
      
      // Redirecionar para página de erro em caso de falha
      const frontendUrl = process.env.FRONTEND_URL || 'https://portal.sabercon.com.br';
      res.redirect(`${frontendUrl}/auth/login?error=google_auth_failed`);
    }
  }
}

export default new AuthController();
