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
  // Só aplicar para requisições GET
  if (req.method !== 'GET') {
    return next();
  }

  // Excluir rotas do Swagger UI e documentação
  if (req.originalUrl.includes('/docs') || req.originalUrl.includes('/swagger')) {
    return next();
  }

  // Criar chave única baseada na URL, query params e usuário
  const userId = req.user?.userId || 'anonymous';
  const cacheKey = `${req.method}:${req.originalUrl}:${userId}`;
  
  // Verificar se há uma resposta em cache recente
  const cached = requestCache[cacheKey];
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`[DEDUP] Returning cached response for ${req.originalUrl}`);
    return res.status(cached.status).json(cached.response);
  }

  // Interceptar a resposta para cachear
  const originalJson = res.json;
  res.json = function(body: any) {
    // Cachear apenas respostas de sucesso e se não foi interceptado antes
    if (res.statusCode >= 200 && res.statusCode < 300 && !res.headersSent) {
      requestCache[cacheKey] = {
        response: body,
        timestamp: Date.now(),
        status: res.statusCode
      };
    }
    return originalJson.call(this, body);
  };

  next();
}; 