import express from 'express';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types/express';

export const validateJWT = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response | void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Por favor, faça login para continuar.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso inválido. Por favor, faça login novamente.'
      });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('❌ JWT_SECRET não configurado');
        return res.status(500).json({
          success: false,
          message: 'Erro de configuração do servidor'
        });
      }

      const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
      
      // Verifica se é uma sessão de fallback (criada quando Redis não está disponível)
      if (decoded.sessionId && decoded.sessionId.startsWith('fallback-')) {
        console.log('⚠️ Usando sessão de fallback (Redis não disponível):', decoded.sessionId);
      }
      
      req.user = decoded;
      
      // Armazena o sessionId para uso em outras partes da aplicação
      if (decoded.sessionId) {
        (req as any).sessionId = decoded.sessionId;
      }
      
      return next();
    } catch (error) {
      console.error('❌ Erro na validação do token:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido. Por favor, faça login novamente.'
        });
      }
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Por favor, faça login novamente.'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Falha na autenticação. Por favor, faça login novamente.'
      });
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({
      success: false,
      message: 'Não foi possível autenticar sua sessão. Por favor, faça login novamente.'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): express.Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Por favor, faça login para continuar.'
      });
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso.'
      });
    }

    next();
  };
};

export const requireInstitution = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): express.Response | void => {
  if (!req.user?.institutionId) {
    return res.status(403).json({
      success: false,
      message: 'Você precisa estar vinculado a uma instituição para acessar este recurso.'
    });
  }

  next();
};
