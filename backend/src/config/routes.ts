import express from 'express';
import authRoutes from '../routes/auth';
import apiRoutes from '../routes';
import SystemSettingsService from '../services/SystemSettingsService';

/**
 * Configura todas as rotas da aplicação
 */
export function setupRoutes(app: express.Application): void {
  // Rota de Health Check
  app.get('/health', (_, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Rota para configurações públicas do sistema
  app.get('/api/settings/public', async (req, res) => {
    try {
      const settings = await SystemSettingsService.getAllSettings(false);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      // Se a tabela não existir ou ocorrer outro erro, retorna um objeto vazio.
      res.status(200).json({ success: true, data: {} });
    }
  });

  // Rotas de autenticação (públicas)
  app.use('/api/auth', authRoutes);

  // Rotas da API (protegidas e públicas, gerenciadas internamente)
  app.use('/api', apiRoutes);

  // Rotas diretas para compatibilidade (sem o prefixo /api)
  app.use('/', apiRoutes);

  // Handler para rotas não encontradas (404)
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint não encontrado: ${req.method} ${req.originalUrl}`,
    });
  });
}
