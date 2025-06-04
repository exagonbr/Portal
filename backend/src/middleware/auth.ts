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
    console.log('🔍 ValidateJWT: Verificando token para:', req.method, req.path);
    console.log('📨 Headers recebidos:', req.headers);

    if (!authHeader) {
      console.warn('❌ ValidateJWT: Header Authorization não encontrado');
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Por favor, faça login para continuar.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      console.warn('❌ ValidateJWT: Token não encontrado no header Authorization');
      return res.status(401).json({
        success: false,
        message: 'Token de acesso inválido. Por favor, faça login novamente.'
      });
    }

    try {
      if (!process.env.JWT_SECRET) {
        console.error('❌ ValidateJWT: JWT_SECRET não configurado!');
        return res.status(500).json({
          success: false,
          message: 'Erro de configuração do servidor.'
        });
      }

      console.log('🔐 ValidateJWT: Verificando token:', token.substring(0, 10) + '...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthTokenPayload;
      
      // Verifica se é uma sessão de fallback (criada quando Redis não está disponível)
      if (decoded.sessionId && decoded.sessionId.startsWith('fallback-')) {
        console.log('⚠️ ValidateJWT: Usando sessão de fallback:', decoded.sessionId);
      }
      
      console.log('✅ ValidateJWT: Token válido para usuário:', decoded.email);
      req.user = decoded;
      
      // Armazena o sessionId para uso em outras partes da aplicação
      if (decoded.sessionId) {
        (req as any).sessionId = decoded.sessionId;
      }
      
      return next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('❌ ValidateJWT: Token inválido:', error.message);
        return res.status(401).json({
          success: false,
          message: 'Sessão inválida. Por favor, faça login novamente.',
          error: error.message
        });
      }
      if (error instanceof jwt.TokenExpiredError) {
        console.error('❌ ValidateJWT: Token expirado');
        return res.status(401).json({
          success: false,
          message: 'Sua sessão expirou. Por favor, faça login novamente.',
          error: 'Token expired'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ ValidateJWT: Erro inesperado:', error);
    return res.status(401).json({
      success: false,
      message: 'Não foi possível autenticar sua sessão. Por favor, faça login novamente.',
      error: error instanceof Error ? error.message : 'Unknown error'
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
