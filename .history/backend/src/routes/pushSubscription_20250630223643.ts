import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireInstitution } from '../middleware/auth';
import { pushSubscriptionController } from '../controllers/pushSubscriptionController';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Subscribe to push notifications
router.post('/', requireInstitution, (req, res) => pushSubscriptionController.subscribe(req, res));

// Unsubscribe from push notifications
router.delete('/:endpoint', requireInstitution, (req, res) => pushSubscriptionController.unsubscribe(req, res));

// Send bulk notification (admin only)
router.post('/send', requireInstitution, (req, res) => pushSubscriptionController.sendBulkNotification(req, res));

export default router;
