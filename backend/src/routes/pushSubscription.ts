import express from 'express';
import { validateJWT } from '../middleware/auth';
import { pushSubscriptionController } from '../controllers/pushSubscriptionController';

const router = express.Router();

// Subscribe to push notifications
router.post('/', validateJWT, pushSubscriptionController.subscribe.bind(pushSubscriptionController));

// Unsubscribe from push notifications
router.delete('/:endpoint', validateJWT, pushSubscriptionController.unsubscribe.bind(pushSubscriptionController));

// Send bulk notification (admin only)
router.post('/send', validateJWT, pushSubscriptionController.sendBulkNotification.bind(pushSubscriptionController));

export default router;
