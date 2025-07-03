import { Router } from 'express';
import { Knex } from 'knex';
import { AwsSettingsController } from '../controllers/AwsSettingsController';
import { requireAuth } from '../middleware/requireAuth';

export function createAwsRoutes(db: Knex): Router {
  const router = Router();
  const awsController = new AwsSettingsController(db);

  // 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
  router.use(requireAuth);

  // Middleware para verificar role de administrador
  const requireAdmin = (req: any, res: any, next: any) => {
    const user = req.user;
    const userRole = user?.role?.toUpperCase();
    
    console.log('🔍 AWS routes - Verificando role:', {
      email: user?.email,
      role: userRole
    });
    
    if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'].includes(userRole)) {
      console.log('❌ Acesso negado para AWS. Role:', userRole);
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - apenas administradores podem acessar configurações AWS'
      });
    }
    
    console.log('✅ Acesso permitido para AWS. Role:', userRole);
    next();
  };

  // Aplicar verificação de role para todas as rotas
  router.use(requireAdmin);

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
  
  // Estatísticas de conexão
  router.get('/connection-logs/stats', async (req, res) => {
    try {
      console.log('🔍 AWS connection-logs/stats acessado por:', (req.user as any)?.email);
      await awsController.getConnectionStats(req, res);
    } catch (error) {
      console.log('❌ Erro na rota AWS stats:', error);
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