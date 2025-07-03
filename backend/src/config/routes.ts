import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import apiRoutes from '../routes';
import authRoutes from '../routes/auth';
import publicRoutes from '../routes/public';
import sessionsRouter from '../routes/sessions';
import healthRoutes from '../routes/health';
import SystemSettingsService from '../services/SystemSettingsService';
import db from '../config/database';


/**
 * Configura todas as rotas da aplicação
 */
export function setupRoutes(app: express.Application): void {
  // Health check routes
  app.use('/api', healthRoutes);
  
  // Simple health check for root
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

  // 🔓 ROTAS PÚBLICAS ESPECÍFICAS (SEM AUTENTICAÇÃO)
  // Rotas de configurações públicas (antes das outras rotas para evitar conflitos)
  app.get('/api/settings/public', async (req, res) => {
    try {
      const hasTable = await db.schema.hasTable('system_settings');
      if (!hasTable) {
        return res.status(200).json({
          success: true,
          data: {}
        });
      }
      const settings = await SystemSettingsService.getAllSettings(false);
      return res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar configurações.'
      });
    }
  });

  app.get('/api/system-settings/public', async (req, res) => {
    try {
      const hasTable = await db.schema.hasTable('system_settings');
      if (!hasTable) {
        return res.status(200).json({
          success: true,
          data: {}
        });
      }
      const settings = await SystemSettingsService.getAllSettings(false);
      return res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar configurações do sistema.'
      });
    }
  });

  // 🔓 ROTAS PÚBLICAS (SEM AUTENTICAÇÃO NECESSÁRIA)
  // Auth routes (login, refresh, logout - no auth required)
  app.use('/api/auth', authRoutes);

  
  // Public routes (no auth required)
  app.use('/api/public', publicRoutes);
  
  // Sessions routes (login não precisa de auth, mas logout sim - configurado internamente)
  app.use('/api/sessions', sessionsRouter);

  // 🔐 ROTAS PROTEGIDAS (COM AUTENTICAÇÃO OBRIGATÓRIA)
  // Aplicar requireAuth apenas nas rotas que realmente precisam
  // Nota: As rotas individuais devem aplicar requireAuth conforme necessário
  app.use('/api', apiRoutes);

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
