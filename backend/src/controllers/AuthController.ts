import { Request, Response } from 'express';
import authService from '../services/AuthService';


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

  /*
  // TODO: Re-implementar o fluxo do Google OAuth com a nova estrutura
  public async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.user as any; // Payload do Passport.js
      if (!payload || !payload.id) {
        res.redirect('/login?error=auth_failed');
        return;
      }

      // Lógica para gerar tokens para o usuário do Google
      // ...
      
      res.redirect('/?token=...');

    } catch (error) {
      console.error('❌ Erro durante autenticação Google:', error);
      res.redirect('/login?error=google_auth_failed');
    }
  }
  */
}

export default new AuthController();
