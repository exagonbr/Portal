import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG, AccessTokenPayload } from '../config/jwt';
import db from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token não fornecido ou formato inválido.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = JWT_CONFIG.SECRET;

    if (!secret) {
      console.error('JWT_SECRET não está configurado nas variáveis de ambiente.');
      return res.status(500).json({ success: false, message: 'Erro interno do servidor: JWT secret não configurado.' });
    }
    
    const decoded = jwt.verify(token, secret) as unknown as AccessTokenPayload;

    if (decoded.type && decoded.type !== 'access') {
      return res.status(403).json({ success: false, message: 'Tipo de token inválido. Token de acesso necessário.' });
    }

    const user = await db('users')
      .where({ id: parseInt(decoded.id), is_active: true })
      .first();

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado ou inativo.' });
    }

    req.user = user;
    next();
    return;

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Token expirado.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: 'Token inválido.' });
    }
    console.error('Erro de autenticação:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor durante a autenticação.' });
  }
}; 