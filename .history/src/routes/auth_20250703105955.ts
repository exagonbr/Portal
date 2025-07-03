import { Router } from 'express';
import { authService } from '../services/AuthService';

const router = Router();

// Rotas de autenticação
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno no servidor' 
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await authService.logout();
    res.json({ success: true });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno no servidor' 
    });
  }
});

router.get('/me', async (req, res) => {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno no servidor' 
    });
  }
});

export default router; 