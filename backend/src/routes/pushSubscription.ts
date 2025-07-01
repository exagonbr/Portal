import express from 'express';
import {
  optimizedAuthMiddleware,
  requirePermission
} from '../middleware/optimizedAuth.middleware';
import { pushSubscriptionController } from '../controllers/pushSubscriptionController';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(optimizedAuthMiddleware);

// Subscribe to push notifications
router.post('/', requirePermission('notifications:subscribe'), (req, res) => pushSubscriptionController.subscribe(req, res));

// Unsubscribe from push notifications
router.delete('/:endpoint', requirePermission('notifications:subscribe'), (req, res) => pushSubscriptionController.unsubscribe(req, res));

// Send bulk notification (admin only)
router.post('/send', requirePermission('notifications:send'), (req, res) => pushSubscriptionController.sendBulkNotification(req, res));

export default router;
