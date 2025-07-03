import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm.config';
import { testRedisConnection } from '../config/redis';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'unknown',
        redis: 'unknown'
      }
    };

    // Verificar conexão com banco de dados
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.query('SELECT 1');
        health.services.database = 'connected';
      } else {
        health.services.database = 'disconnected';
      }
    } catch (error) {
      health.services.database = 'error';
    }

    // Verificar conexão com Redis
    try {
      const redisConnected = await testRedisConnection();
      health.services.redis = redisConnected ? 'connected' : 'disconnected';
    } catch (error) {
      health.services.redis = 'error';
    }

    // Determinar status geral
    const hasErrors = Object.values(health.services).includes('error');
    const hasDisconnected = Object.values(health.services).includes('disconnected');
    
    if (hasErrors) {
      health.status = 'error';
      return res.status(503).json(health);
    } else if (hasDisconnected) {
      health.status = 'degraded';
      return res.status(200).json(health);
    }

    res.status(200).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * Simple ping endpoint
 * GET /api/ping
 */
router.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

export default router; 