/**
 * Middleware de Autenticação Unificado
 * ÚNICO middleware JWT para todo o backend
 */

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';

// Interface para o usuário autenticado
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  institutionId?: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

// Estender o Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * 🔐 MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO JWT
 * 
 * ✅ Valida apenas tokens JWT reais (HS256)
 * ✅ Resposta padronizada: { success: boolean, data/message }
 * ✅ Um único secret compartilhado
 * ✅ Sem fallback base64 (produção limpa)
 * ✅ Performance otimizada
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // 1. Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorização não fornecido'
      });
    }

    const token = authHeader.substring(7).trim();
    
    if (!token || token.length < 10) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou vazio'
      });
    }

    // 2. Verificar se é um token JWT válido (3 partes)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // 3. Validar JWT com o secret unificado
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.JWT_SECRET, {
        algorithms: [JWT_CONFIG.ALGORITHM]
      }) as any;

      // 4. Validar estrutura do payload
      if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
        return res.status(401).json({
          success: false,
          message: 'Payload do token inválido'
        });
      }

      // 5. Criar objeto user padronizado
      const user: AuthenticatedUser = {
        id: decoded.userId,
        email: decoded.email || '',
        name: decoded.name || '',
        role: decoded.role || 'user',
        permissions: decoded.permissions || [],
        institutionId: decoded.institutionId,
        sessionId: decoded.sessionId,
        iat: decoded.iat,
        exp: decoded.exp
      };

      // 6. Anexar usuário à requisição
      req.user = user;
      
      // 7. Continuar para o próximo middleware
      next();

    } catch (jwtError: any) {
      // Tratar erros específicos do JWT
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Falha na validação do token'
      });
    }

  } catch (error) {
    console.error('❌ Erro no middleware requireAuth:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * 🔐 MIDDLEWARE OPCIONAL DE AUTENTICAÇÃO
 * Para rotas que podem funcionar com ou sem autenticação
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // Se não há header, continua sem autenticação
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7).trim();
    
    // Se token vazio, continua sem autenticação
    if (!token || token.length < 10) {
      return next();
    }

    // Tentar validar JWT
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.JWT_SECRET, {
        algorithms: [JWT_CONFIG.ALGORITHM]
      }) as any;

      if (decoded && typeof decoded === 'object' && decoded.userId) {
        req.user = {
          id: decoded.userId,
          email: decoded.email || '',
          name: decoded.name || '',
          role: decoded.role || 'user',
          permissions: decoded.permissions || [],
          institutionId: decoded.institutionId,
          sessionId: decoded.sessionId,
          iat: decoded.iat,
          exp: decoded.exp
        };
      }
    } catch (jwtError) {
      // Em caso de erro, apenas continua sem autenticação
      console.warn('⚠️ Token inválido em optionalAuth:', jwtError);
    }

    next();
  } catch (error) {
    console.error('❌ Erro no middleware optionalAuth:', error);
    next();
  }
};
