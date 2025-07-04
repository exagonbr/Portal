import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar se o usuário autenticado possui uma role de administrador.
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Assegura que req.user exista e tenha a propriedade 'role'
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou role não definida.'
      });
    }

    const userRole = req.user.role.authority?.toUpperCase() || '';
    const adminRoles = ['ADMIN', 'SYSTEM_ADMIN', 'ADMINISTRATOR'];

    if (!adminRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Este recurso é restrito a administradores.',
      });
    }

    // Se a role for de administrador, permite o acesso
    next();

  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao verificar as permissões de administrador.' 
    });
  }
};