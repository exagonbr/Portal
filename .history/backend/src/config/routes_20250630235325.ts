import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import apiRoutes from '../routes';
import authRoutes from '../routes/auth';
import publicRoutes from '../routes/public';
import { authMiddleware } from '../middleware/auth';

/**
 * Configura todas as rotas da aplicação
 */
export function setupRoutes(app: express.Application): void {
  // Health check
  app.get('/health', (_, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Swagger UI at /backend/docs
  app.use('/backend/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Portal Sabercon API Documentation',
    customfavIcon: '/favicon.ico',
  }));

  // Redirect /backend to /backend/docs
  app.get('/backend', (_, res) => {
    res.redirect('/backend/docs');
  });

  // Public routes (no auth required)
  app.use('/api', publicRoutes);

  // Auth routes (now under /api/auth)
  app.use('/api/auth', authRoutes);

  // Mount API Routes with authentication
  app.use('/api', authMiddleware, apiRoutes);

  // Mount direct routes for compatibility (without /api prefix)
  // These routes will have optional authentication for public endpoints
  app.use('/', apiRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint não encontrado',
      path: req.originalUrl
    });
  });
} 