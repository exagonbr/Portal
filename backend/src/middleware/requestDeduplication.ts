import { Request, Response, NextFunction } from 'express';

interface RequestCache {
  [key: string]: {
    response: any;
    timestamp: number;
    status: number;
  };
}

const requestCache: RequestCache = {};
const CACHE_DURATION = 1000; // 1 segundo

// Limpar cache periodicamente
setInterval(() => {
  const now = Date.now();
  Object.keys(requestCache).forEach(key => {
    if (now - requestCache[key].timestamp > CACHE_DURATION) {
      delete requestCache[key];
    }
  });
}, 5000); // Limpar a cada 5 segundos

export const requestDeduplication = (req: Request, res: Response, next: NextFunction) => {
  // Desabilitar deduplicação para evitar problemas de rate limiting
  // Apenas passar para o próximo middleware
  next();
}; 