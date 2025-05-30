import { Router } from 'express';
import { Knex } from 'knex';
import { AwsSettingsController } from '../controllers/AwsSettingsController';
import { validateJWT, requireRole } from '../middleware/auth';

export function createAwsRoutes(db: Knex): Router {
  const router = Router();
  const awsController = new AwsSettingsController(db);

  // Aplicar autenticação e autorização para todas as rotas
  router.use(validateJWT);
  router.use(requireRole(['admin'])); // Apenas administradores podem acessar configurações AWS

  // Configurações AWS
  router.get('/settings', (req, res) => awsController.getActiveSettings(req, res));
  router.get('/settings/all', (req, res) => awsController.getAllSettings(req, res));
  router.get('/settings/history', (req, res) => awsController.getSettingsHistory(req, res));
  router.get('/settings/:id', (req, res) => awsController.getSettingsById(req, res));
  router.post('/settings', (req, res) => awsController.createSettings(req, res));
  router.put('/settings/:id', (req, res) => awsController.updateSettings(req, res));
  router.post('/settings/:id/activate', (req, res) => awsController.setActiveSettings(req, res));
  router.delete('/settings/:id', (req, res) => awsController.deleteSettings(req, res));

  // Teste de conexão
  router.post('/settings/:id/test-connection', (req, res) => awsController.testConnection(req, res));

  // Logs de conexão
  router.get('/connection-logs', (req, res) => awsController.getConnectionLogs(req, res));
  router.get('/connection-logs/stats', (req, res) => awsController.getConnectionStats(req, res));
  router.get('/connection-logs/trends', (req, res) => awsController.getConnectionTrends(req, res));

  return router;
} 