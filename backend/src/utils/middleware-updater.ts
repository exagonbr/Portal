/**
 * Utilitário para aplicar middlewares inteligentes automaticamente
 * Este arquivo contém funções helper para migrar rotas para os novos middlewares
 */

import { Router } from 'express';
import { validateJWTSmart, requireRoleSmart } from '../middleware/auth';
import { validateJWTSmart as validateJWTSmartSession } from '../middleware/sessionMiddleware';

/**
 * Aplica middlewares inteligentes baseado no tipo de rota
 */
export function applySmartMiddleware(router: Router, routePath: string, originalMiddlewares: any[]) {
  const highRiskRoutes = [
    '/dashboard',
    '/sessions',
    '/aws/connection-logs/stats',
    '/metrics',
    '/analytics',
    '/stats'
  ];

  const isHighRisk = highRiskRoutes.some(route => routePath.includes(route));
  const smartMiddlewares: any[] = [];

  originalMiddlewares.forEach(middleware => {
    if (middleware.name === 'validateJWT' || middleware.name === 'validateJWTAndSession') {
      // Usar middleware inteligente baseado no risco da rota
      if (isHighRisk) {
        smartMiddlewares.push(validateJWTSmartSession);
      } else {
        smartMiddlewares.push(validateJWTSmart);
      }
    } else if (middleware.name === 'requireRole') {
      // Usar middleware de role inteligente
      smartMiddlewares.push(requireRoleSmart);
    } else {
      // Manter outros middlewares como estão
      smartMiddlewares.push(middleware);
    }
  });

  return smartMiddlewares;
}

/**
 * Wrapper para rotas que adiciona tratamento de erro automático
 */
export function withErrorHandling(handler: any) {
  return async (req: any, res: any, next: any) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      console.error(`❌ Erro na rota ${req.path}:`, error);
      
      // Resposta de fallback
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
          error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
      }
    }
  };
}

/**
 * Wrapper para rotas que adiciona timeout automático
 */
export function withTimeout(handler: any, timeoutMs: number = 10000) {
  return async (req: any, res: any, next: any) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Route timeout')), timeoutMs);
    });

    const handlerPromise = handler(req, res, next);

    try {
      await Promise.race([handlerPromise, timeoutPromise]);
    } catch (error) {
      console.error(`⚠️ Timeout ou erro na rota ${req.path}:`, error);
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Operação expirou ou falhou',
          timeout: true
        });
      }
    }
  };
}

/**
 * Aplica todos os wrappers de segurança para uma rota
 */
export function secureRoute(handler: any, options: {
  timeout?: number;
  errorHandling?: boolean;
} = {}) {
  let securedHandler = handler;

  if (options.errorHandling !== false) {
    securedHandler = withErrorHandling(securedHandler);
  }

  if (options.timeout) {
    securedHandler = withTimeout(securedHandler, options.timeout);
  }

  return securedHandler;
}

/**
 * Configurações padrão para diferentes tipos de rotas
 */
export const ROUTE_CONFIGS = {
  dashboard: {
    timeout: 15000,
    errorHandling: true,
    middleware: 'smart-session'
  },
  api: {
    timeout: 10000,
    errorHandling: true,
    middleware: 'smart-auth'
  },
  stats: {
    timeout: 8000,
    errorHandling: true,
    middleware: 'simple'
  },
  upload: {
    timeout: 30000,
    errorHandling: true,
    middleware: 'smart-auth'
  }
}; 