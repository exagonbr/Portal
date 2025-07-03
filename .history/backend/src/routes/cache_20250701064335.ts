import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getRedisClient, TTL } from '../config/redis';
import { RoleService } from '../services/RoleService';
import { Logger } from '../utils/Logger';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

const logger = new Logger('CacheRoutes');
const roleService = new RoleService();

// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores podem gerenciar cache'
    });
  }
  
  next();
};

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
router.get('/get', requireAdmin, async (req, res) => {
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
router.post('/set', requireAdmin, async (req, res) => {
  try {
    const { key, value, ttl = TTL.CACHE } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Cache key is required'
      });
    }

    const redis = getRedisClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    await redis.set(key, stringValue, 'EX', ttl);
    
    logger.info(`Cache set for key: ${key}`, { userId: (req.user as any)?.email });
    
    return res.json({
      success: true,
      message: 'Value cached successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error(`Error setting cache value: ${errorMessage}`, {
      userId: (req.user as any)?.email
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
 *   delete:
 *     summary: Delete value from cache
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
 *         description: Value deleted successfully
 */
router.delete('/delete', requireAdmin, async (req, res) => {
  try {
    const { key } = req.query;
    
    if (!key || typeof key !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Cache key is required'
      });
    }

    const redis = getRedisClient();
    const deleted = await redis.del(key);
    
    logger.info(`Cache delete for key: ${key}, deleted: ${deleted}`, { userId: (req.user as any)?.email });
    
    return res.json({
      success: true,
      message: deleted > 0 ? 'Value deleted successfully' : 'Key not found',
      deleted: deleted > 0
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error(`Error deleting cache value: ${errorMessage}`, {
      userId: (req.user as any)?.email
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
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 */
router.post('/clear', requireAdmin, async (req, res) => {
  try {
    const redis = getRedisClient();
    await redis.flushall();
    
    logger.info('Cache cleared', { userId: (req.user as any)?.email });
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error(`Error clearing cache: ${errorMessage}`, {
      userId: (req.user as any)?.email
    });
    
    res.status(500).json({
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
router.get('/stats', requireAdmin, async (req, res) => {
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
    console.log('Error getting cache stats:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router; 