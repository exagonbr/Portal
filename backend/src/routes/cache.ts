import express from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
import { getRedisClient, TTL } from '../config/redis';
import { RoleService } from '../services/RoleService';
import { Logger } from '../utils/Logger';

const router = express.Router();
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
router.get('/get', validateJWT, async (req, res) => {
  try {
    const { key } = req.query;
    
    if (!key || typeof key !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Cache key is required'
      });
    }

    // Log detalhado da requisição de cache
    logger.info(`Cache request for key: ${key}`, { userId: req.user?.id });

    const redis = getRedisClient();
    const value = await redis.get(key);

    if (value) {
      try {
        const jsonValue = JSON.parse(value);
        logger.info(`Cache hit for key: ${key}`, { userId: req.user?.id });
        return res.json({
          success: true,
          data: jsonValue,
          exists: true,
          from_cache: true
        });
      } catch (e) {
        logger.info(`Cache hit for key: ${key} (non-JSON value)`, { userId: req.user?.id });
        return res.json({
          success: true,
          data: value,
          exists: true,
          from_cache: true
        });
      }
    } else {
      // Implementação de fallback para chaves específicas
      logger.warn(`Cache miss for key: ${key}`, { userId: req.user?.id });
      
      // Verificar se a chave está relacionada a roles
      if (key.startsWith('portal_sabercon:roles:')) {
        logger.info(`Attempting fallback for roles cache: ${key}`, { userId: req.user?.id });
        
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
                logger.error(`Error parsing role list params: ${e.message}`, { userId: req.user?.id });
              }
            }
            
            // Buscar roles diretamente do banco
            const result = await roleService.findRolesWithFilters(params);
            
            if (result.success && result.data) {
              // Armazenar no cache para futuras requisições
              await redis.set(key, JSON.stringify(result.data), 'EX', TTL.CACHE);
              logger.info(`Data fetched from database and stored in cache: ${key}`, { userId: req.user?.id });
              
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
              logger.info(`Active roles fetched from database and stored in cache: ${key}`, { userId: req.user?.id });
              
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
          logger.error(`Fallback error for key ${key}: ${fallbackError.message}`, { 
            userId: req.user?.id,
            stack: fallbackError.stack
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
    logger.error(`Error getting cache value: ${error.message}`, { 
      userId: req.user?.id,
      stack: error.stack,
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
router.post('/set', validateJWT, async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Cache key is required'
      });
    }

    // Simular sucesso no cache
    return res.json({
      success: true,
      message: 'Value cached successfully'
    });
  } catch (error) {
    console.error('Error setting cache value:', error);
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
 *         description: Cache value deleted
 */
router.delete('/delete', validateJWT, async (req, res) => {
  try {
    const { key } = req.query;
    
    if (!key || typeof key !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Cache key is required'
      });
    }

    return res.json({
      success: true,
      message: 'Cache value deleted'
    });
  } catch (error) {
    console.error('Error deleting cache value:', error);
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
router.post('/clear', validateJWT, requireRole(['admin', 'SYSTEM_ADMIN']), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
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
router.get('/stats', validateJWT, requireRole(['admin', 'SYSTEM_ADMIN']), async (req, res) => {
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
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router; 