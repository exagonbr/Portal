import { Router } from 'express';
import { Knex } from 'knex';
import { AwsSettingsController } from '../controllers/AwsSettingsController';
import { validateJWT, requireRole } from '../middleware/auth';
import { validateJWTSimple } from '../middleware/sessionMiddleware';

export function createAwsRoutes(db: Knex): Router {
  const router = Router();
  const awsController = new AwsSettingsController(db);

  // Aplicar autenticação e autorização para todas as rotas (exceto stats)
  router.use((req, res, next) => {
    // Usar middleware simples para a rota stats para evitar loops
    if (req.path === '/connection-logs/stats') {
      return validateJWTSimple(req as any, res, next);
    }
    // Usar middleware normal para outras rotas
    return validateJWT(req, res, next);
  });

  // Middleware de role apenas para rotas que não são stats
  router.use((req, res, next) => {
    if (req.path === '/connection-logs/stats') {
      // Verificação manual de role para stats
      const userRole = (req.user as any)?.role?.toLowerCase();
      if (!userRole || !['admin', 'system_admin'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem acessar estatísticas AWS.'
        });
      }
      return next();
    }
    // Usar middleware normal para outras rotas
    return requireRole(['admin', 'SYSTEM_ADMIN'])(req, res, next);
  });

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
  
  // Rota stats com tratamento especial para evitar loops
  router.get('/connection-logs/stats', async (req, res) => {
    try {
      console.log('🔍 AWS connection-logs/stats acessado por:', (req.user as any)?.email);
      await awsController.getConnectionStats(req, res);
    } catch (error) {
      console.error('❌ Erro na rota AWS stats:', error);
      // Fallback com dados mock em caso de erro
      res.json({
        success: true,
        data: {
          total_connections: 0,
          successful_connections: 0,
          failed_connections: 0,
          success_rate: 0,
          average_response_time: 0,
          last_connection: null,
          last_successful_connection: null,
          services_used: [],
          note: 'Dados limitados devido a erro interno'
        }
      });
    }
  });
  
  router.get('/connection-logs/trends', (req, res) => awsController.getConnectionTrends(req, res));

  return router;
} 