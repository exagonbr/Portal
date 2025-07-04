import { Request, Response } from 'express';
import authService from '../services/AuthService';

class AuthController {
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
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies.jid;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token não encontrado.' });
    }

    try {
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
    } catch (error) {
        console.error('Erro ao renovar token:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  }

  public async logout(req: Request, res: Response): Promise<Response> {
    authService.clearRefreshToken(res);
    return res.json({ success: true, message: 'Logout realizado com sucesso.' });
  }
}

export default new AuthController();