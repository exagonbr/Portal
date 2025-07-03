import { Request, Response, NextFunction } from 'express';
import { cacheService, CacheKeys, CacheTTL } from '../services/CacheService';
import { Logger } from '../utils/Logger';
import crypto from 'crypto';

interface CacheMiddlewareOptions {
  ttl?: number;
  tags?: string[];
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  invalidateOnMethods?: string[];
  varyBy?: string[];
}

/**
 * Middleware para cache automático de responses HTTP
 */
export class CacheMiddleware {
  private static logger = new Logger('CacheMiddleware');

  /**
   * Cria middleware de cache para rotas
   */
  public static create(options: CacheMiddlewareOptions = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const {
        ttl = CacheTTL.MEDIUM,
        tags = [],
        keyGenerator = CacheMiddleware.defaultKeyGenerator,
        condition = () => req.method === 'GET',
        invalidateOnMethods = ['POST', 'PUT', 'DELETE', 'PATCH'],
        varyBy = []
      } = options;

      // Verificar se deve aplicar cache
      if (!condition(req)) {
        return next();
      }

      const cacheKey = keyGenerator(req);
      
      // Para métodos que invalidam cache
      if (invalidateOnMethods.includes(req.method)) {
        await CacheMiddleware.invalidateRelatedCache(req, tags);
        return next();
      }

      try {
        // Tentar obter do cache
        const cachedResponse = await cacheService.get<any>(cacheKey);
        
        if (cachedResponse) {
          CacheMiddleware.logger.debug(`✅ Cache hit para ${req.path}`);
          
          // Definir headers de cache
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey);
          
          return res.json(cachedResponse);
        }

        // Cache miss - interceptar response
        CacheMiddleware.logger.debug(`❌ Cache miss para ${req.path}`);
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);

        // Salvar método original de send
        const originalSend = res.json;
        
        res.json = function(data: any) {
          // Salvar no cache apenas se response for bem-sucedida
          if (res.statusCode >= 200 && res.statusCode < 300) {
            cacheService.set(cacheKey, data, {
              ttl,
              tags: [...tags, `route:${req.route?.path || req.path}`]
            }).catch(error => {
              CacheMiddleware.logger.error('Erro ao salvar no cache:', error);
            });
          }
          
          // Chamar método original
          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        CacheMiddleware.logger.error('Erro no middleware de cache:', error);
        next();
      }
    };
  }

  /**
   * Gerador padrão de chaves de cache
   */
  private static defaultKeyGenerator(req: Request): string {
    const base = `${req.method}:${req.path}`;
    const query = JSON.stringify(req.query);
    const body = req.method !== 'GET' ? JSON.stringify(req.body) : '';
    const userId = (req as any).user?.id || 'anonymous';
    
    const hash = crypto
      .createHash('md5')
      .update(`${base}:${query}:${body}:${userId}`)
      .digest('hex');
    
    return `route:${hash}`;
  }

  /**
   * Invalida cache relacionado
   */
  private static async invalidateRelatedCache(req: Request, tags: string[]): Promise<void> {
    try {
      // Invalidar por tags específicas
      for (const tag of tags) {
        await cacheService.invalidateByTag(tag);
      }

      // Invalidar cache relacionado à rota
      const routeTag = `route:${req.route?.path || req.path}`;
      await cacheService.invalidateByTag(routeTag);

      CacheMiddleware.logger.info(`🧹 Cache invalidado para rota: ${req.path}`);
    } catch (error) {
      CacheMiddleware.logger.error('Erro ao invalidar cache:', error);
    }
  }

  /**
   * Middleware específico para queries de usuários
   */
  public static userCache(ttl: number = CacheTTL.MEDIUM) {
    return CacheMiddleware.create({
      ttl,
      tags: ['users'],
      keyGenerator: (req) => {
        const filters = JSON.stringify(req.query);
        return CacheKeys.USER_LIST(filters);
      },
      invalidateOnMethods: ['POST', 'PUT', 'DELETE', 'PATCH']
    });
  }

  /**
   * Middleware específico para queries de cursos
   */
  public static courseCache(ttl: number = CacheTTL.LONG) {
    return CacheMiddleware.create({
      ttl,
      tags: ['courses'],
      keyGenerator: (req) => {
        const filters = JSON.stringify(req.query);
        return CacheKeys.COURSE_LIST(filters);
      },
      invalidateOnMethods: ['POST', 'PUT', 'DELETE', 'PATCH']
    });
  }

  /**
   * Middleware específico para dados estáticos
   */
  public static staticCache(ttl: number = CacheTTL.STATIC) {
    return CacheMiddleware.create({
      ttl,
      tags: ['static'],
      condition: (req) => req.method === 'GET',
      invalidateOnMethods: []
    });
  }

  /**
   * Middleware específico para queries de banco
   */
  public static queryCache(ttl: number = CacheTTL.QUERY) {
    return CacheMiddleware.create({
      ttl,
      tags: ['queries'],
      keyGenerator: (req) => {
        const hash = crypto
          .createHash('md5')
          .update(`${req.path}:${JSON.stringify(req.query)}:${JSON.stringify(req.body)}`)
          .digest('hex');
        return CacheKeys.QUERY(hash);
      }
    });
  }
}

/**
 * Middleware para invalidação automática de cache
 */
export const autoInvalidateCache = (tags: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Salvar método original
    const originalSend = res.json;
    
    res.json = function(data: any) {
      // Se operação foi bem-sucedida, invalidar cache
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const invalidationTags = [
          ...tags,
          `route:${req.route?.path || req.path}`,
          `method:${req.method.toLowerCase()}`
        ];

        // Invalidar de forma assíncrona
        Promise.all(
          invalidationTags.map(tag => cacheService.invalidateByTag(tag))
        ).catch(error => {
          CacheMiddleware.logger.error('Erro na invalidação automática:', error);
        });
      }
      
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Middleware para cache baseado em condições
 */
export const conditionalCache = (
  condition: (req: Request) => boolean,
  options: CacheMiddlewareOptions = {}
) => {
  return CacheMiddleware.create({
    ...options,
    condition
  });
};

/**
 * Middleware para cache por role de usuário
 */
export const roleBasedCache = (roles: string[], ttl: number = CacheTTL.MEDIUM) => {
  return conditionalCache(
    (req) => {
      const userRole = (req as any).user?.role;
      return roles.includes(userRole);
    },
    {
      ttl,
      keyGenerator: (req) => {
        const userRole = (req as any).user?.role || 'anonymous';
        const hash = crypto
          .createHash('md5')
          .update(`${req.path}:${JSON.stringify(req.query)}:${userRole}`)
          .digest('hex');
        return `role_cache:${userRole}:${hash}`;
      },
      tags: ['role_based']
    }
  );
};

export default CacheMiddleware; 