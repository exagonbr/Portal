import express from 'express';
import { validateJWT, requireInstitution } from '../middleware/auth';
import { pushSubscriptionController } from '../controllers/pushSubscriptionController';

const router = express.Router();

// Subscribe to push notifications
router.post('/', validateJWT, requireInstitution, pushSubscriptionController.subscribe.bind(pushSubscriptionController));

// Unsubscribe from push notifications
router.delete('/:endpoint', validateJWT, requireInstitution, pushSubscriptionController.unsubscribe.bind(pushSubscriptionController));

// Send bulk notification (admin only)
router.post('/send', validateJWT, requireInstitution, pushSubscriptionController.sendBulkNotification.bind(pushSubscriptionController));

export default router;
