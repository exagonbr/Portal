import { Router } from 'express';
import type { Knex } from 'knex';
import { AwsAnalyticsController } from '../controllers/AwsAnalyticsController';
import { validateJWT, requireRole } from '../middleware/auth';

export function createAwsAdminRoutes(db: Knex): Router {
  const router = Router();
  const awsAdminController = new AwsAnalyticsController(db);

  // Aplicar autenticação e autorização para todas as rotas
  router.use(validateJWT);
  router.use(requireRole(['SYSTEM_ADMIN'])); // Apenas administradores do sistema podem acessar analytics AWS

  // Endpoints para AWS Analytics
  router.post('/test-config', (req, res) => awsAdminController.testAwsConnection(req, res));
  router.post('/system-analytics', (req, res) => awsAdminController.getSystemAnalytics(req, res));
  router.post('/s3-storage-info', (req, res) => awsAdminController.getS3StorageInfo(req, res));
  router.post('/cloudwatch-metrics', (req, res) => awsAdminController.getCloudWatchMetrics(req, res));
  router.post('/instance-status', (req, res) => awsAdminController.getInstanceStatus(req, res));

  // Analytics
  router.get('/analytics/stats', (req, res) => awsAdminController.getAnalyticsStats(req, res));

  return router;
} 