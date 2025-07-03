import express from 'express';
import { errorLogger } from '../middleware/logging';

/**
 * Configura o tratamento de erros da aplicação
 */
export function setupErrorHandling(app: express.Application): void {
  // Error logger middleware
  app.use(errorLogger);

  // Error handler
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    let status = 500;
    let message = 'Erro interno do servidor';
    let stack: string | undefined = undefined;
    
    if (err && typeof err === 'object') {
      // Verifica se o objeto tem as propriedades esperadas
      if ('status' in err && typeof err.status === 'number') {
        status = err.status;
      } else if ('statusCode' in err && typeof err.statusCode === 'number') {
        status = err.statusCode;
      }
      
      if ('message' in err && typeof err.message === 'string') {
        message = err.message;
      }
      
      if (process.env.NODE_ENV === 'development' && 'stack' in err && typeof err.stack === 'string') {
        stack = err.stack;
      }
    }
    
    res.status(status).json({
      success: false,
      message,
      ...(stack && { stack })
    });
  });
} 