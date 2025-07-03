import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth';
import { getRedisClient, TTL } from '../config/redis';
import { RoleService } from '../services/RoleService';
import { Logger } from '../utils/Logger';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);
const logger = new Logger('CacheRoutes');
const roleService = new RoleService();

/**
 * @swagger
 * /api/cache/get:
 *   get:
 *     summary: Get value from cache
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Cache key
 *     responses:
 *       200:
 *         description: Cache value found
 *       404:
 *         description: Cache key not found
 */
router.get('/get', async (req, res) => {
  try {
    const { key } = req.query;
    
    if (!key || typeof key !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Cache key is required'
      });
    }

    // Log detalhado da requisição de cache
    logger.info(`Cache request for key: ${key}`, { userId: (req.user as any)?.email });

    const redis = getRedisClient();
    const value = await redis.get(key);

    if (value) {
      try {
        const jsonValue = JSON.parse(value);
        logger.info(`Cache hit for key: ${key}`, { userId: (req.user as any)?.email });
        return res.json({
          success: true,
          data: jsonValue,
          exists: true,
          from_cache: true
        });
      } catch (e) {
        logger.info(`Cache hit for key: ${key} (non-JSON value)`, { userId: (req.user as any)?.email });
        return res.json({
          success: true,
          data: value,
          exists: true,
          from_cache: true
        });
      }
    } else {
      // Implementação de fallback para chaves específicas
      logger.warn(`Cache miss for key: ${key}`, { userId: (req.user as any)?.email });
      
      // Verificar se a chave está relacionada a roles
      if (key.startsWith('portal_sabercon:roles:')) {
        logger.info(`Attempting fallback for roles cache: ${key}`, { userId: (req.user as any)?.email });
        
        try {
          // Extrair os parâmetros da chave
          let params = {};
          
          if (key.includes('list:')) {
            // Extrair parâmetros da lista de roles
            const paramsString = key.split('list:')[1];
            if (paramsString) {
              try {
                params = JSON.parse(paramsString);
                logger.info('Parsed params for roles list:', params);
              } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                logger.error(`Error parsing role list params: ${errorMessage}`, { userId: (req.user as any)?.email });
              }
            }
            
            // Buscar roles diretamente do banco
            const result = await roleService.findRolesWithFilters(params);
            
            if (result.success && result.data) {
              // Armazenar no cache para futuras requisições
              await redis.set(key, JSON.stringify(result.data), 'EX', TTL.CACHE);
              logger.info(`Data fetched from database and stored in cache: ${key}`, { userId: (req.user as any)?.email });
              
              return res.json({
                success: true,
                data: result.data,
                exists: true,
                from_cache: false,
                fallback_used: true
              });
            }
          } else if (key.includes(':active')) {
            // Buscar roles ativos
            const result = await roleService.findRolesWithFilters({ 
              active: true, 
              page: 1, 
              limit: 100,
              sortBy: 'name',
              sortOrder: 'asc'
            });
            
            if (result.success && result.data) {
              // Armazenar no cache para futuras requisições
              await redis.set(key, JSON.stringify(result.data), 'EX', TTL.CACHE);
              logger.info(`Active roles fetched from database and stored in cache: ${key}`, { userId: (req.user as any)?.email });
              
              return res.json({
                success: true,
                data: result.data,
                exists: true,
                from_cache: false,
                fallback_used: true
              });
            }
          }
        } catch (fallbackError) {
          const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          const errorStack = fallbackError instanceof Error ? fallbackError.stack : undefined;
          
          logger.error(`Fallback error for key ${key}: ${errorMessage}`, {
            userId: (req.user as any)?.email,
            stack: errorStack
          });
        }
      }
      
      // Se chegou aqui, não foi possível implementar fallback
      return res.status(404).json({
        success: false,
        message: 'Cache key not found',
        exists: false
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error getting cache value: ${errorMessage}`, {
      userId: (req.user as any)?.email,
      stack: errorStack,
      key: req.query.key
    });
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/cache/set:
 *   post:
 *     summary: Set value in cache
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: object
 *               ttl:
 *                 type: number
 *     responses:
 *       200:
 *         description: Value cached successfully
 */
router.post('/set', async (req, res) => {
  try {
    const { key, value, ttl } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Cache key is required'
      });
    }

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Cache value is required'
      });
    }

    try {
      const redis = getRedisClient();
      const serializedValue = JSON.stringify(value);
      const cacheTTL = ttl || TTL.CACHE;

      // Salvar no Redis com TTL
      if (cacheTTL > 0) {
        await redis.set(key, serializedValue, 'EX', cacheTTL);
      } else {
        await redis.set(key, serializedValue);
      }

      logger.info(`Cache set for key: ${key}`, { 
        userId: (req.user as any)?.email,
        ttl: cacheTTL,
        valueSize: serializedValue.length
      });

      return res.json({
        success: true,
        message: 'Value cached successfully',
        key,
        ttl: cacheTTL
      });
    } catch (redisError) {
      const errorMessage = redisError instanceof Error ? redisError.message : String(redisError);
      logger.error(`Redis error setting cache: ${errorMessage}`, {
        userId: (req.user as any)?.email,
        key,
        stack: redisError instanceof Error ? redisError.stack : undefined
      });

      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar no cache Redis'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error setting cache value: ${errorMessage}`, {
      userId: (req.user as any)?.email,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/cache/delete:
 *   post:
 *     summary: Delete value from cache
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cache value deleted
 */
router.post('/delete', async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Cache key is required'
      });
    }

    try {
      const redis = getRedisClient();
      const result = await redis.del(key);

      logger.info(`Cache delete for key: ${key}`, { 
        userId: (req.user as any)?.email,
        deleted: result > 0
      });

      return res.json({
        success: true,
        message: 'Cache value deleted successfully',
        key,
        deleted: result > 0
      });
    } catch (redisError) {
      const errorMessage = redisError instanceof Error ? redisError.message : String(redisError);
      logger.error(`Redis error deleting cache: ${errorMessage}`, {
        userId: (req.user as any)?.email,
        key,
        stack: redisError instanceof Error ? redisError.stack : undefined
      });

      return res.status(500).json({
        success: false,
        message: 'Erro ao deletar do cache Redis'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error deleting cache value: ${errorMessage}`, {
      userId: (req.user as any)?.email,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/cache/invalidate:
 *   post:
 *     summary: Invalidate cache by pattern
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pattern:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cache pattern invalidated successfully
 */
router.post('/invalidate', async (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: 'Pattern is required'
      });
    }

    try {
      const redis = getRedisClient();
      
      // Buscar chaves que correspondem ao padrão
      const keys = await redis.keys(pattern);
      
      let deletedCount = 0;
      if (keys.length > 0) {
        deletedCount = await redis.del(...keys);
      }

      logger.info(`Cache invalidate pattern: ${pattern}`, { 
        userId: (req.user as any)?.email,
        keysFound: keys.length,
        deletedCount
      });

      return res.json({
        success: true,
        message: 'Cache pattern invalidated successfully',
        pattern,
        keysFound: keys.length,
        deletedCount
      });
    } catch (redisError) {
      const errorMessage = redisError instanceof Error ? redisError.message : String(redisError);
      logger.error(`Redis error invalidating pattern: ${errorMessage}`, {
        userId: (req.user as any)?.email,
        pattern,
        stack: redisError instanceof Error ? redisError.stack : undefined
      });

      return res.status(500).json({
        success: false,
        message: 'Erro ao invalidar padrão no cache Redis'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error invalidating cache pattern: ${errorMessage}`, {
      userId: (req.user as any)?.email,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/cache/clear:
 *   post:
 *     summary: Clear all cache
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pattern:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 */
router.post('/clear', requireRole(['SYSTEM_ADMIN']), async (req, res) => {
  try {
    const { pattern } = req.body;
    
    try {
      const redis = getRedisClient();
      const searchPattern = pattern || '*';
      
      // Buscar chaves que correspondem ao padrão
      const keys = await redis.keys(searchPattern);
      
      let deletedCount = 0;
      if (keys.length > 0) {
        deletedCount = await redis.del(...keys);
      }

      logger.info(`Cache clear with pattern: ${searchPattern}`, { 
        userId: (req.user as any)?.email,
        keysFound: keys.length,
        deletedCount
      });

      return res.json({
        success: true,
        message: 'Cache cleared successfully',
        pattern: searchPattern,
        keysFound: keys.length,
        deletedCount
      });
    } catch (redisError) {
      const errorMessage = redisError instanceof Error ? redisError.message : String(redisError);
      logger.error(`Redis error clearing cache: ${errorMessage}`, {
        userId: (req.user as any)?.email,
        pattern,
        stack: redisError instanceof Error ? redisError.stack : undefined
      });

      return res.status(500).json({
        success: false,
        message: 'Erro ao limpar cache Redis'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error clearing cache: ${errorMessage}`, {
      userId: (req.user as any)?.email,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache statistics
 */
router.get('/stats', requireRole(['admin', 'SYSTEM_ADMIN']), async (req, res) => {
  try {
    const stats = {
      keys: 0,
      memory: 0,
      hits: 0,
      misses: 0,
      hitRate: 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error getting cache stats:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router; 