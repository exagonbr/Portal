import express from 'express';
import { validateJWT, requireInstitution } from '../middleware/auth';
import { pushSubscriptionController } from '../controllers/pushSubscriptionController';

const router = express.Router();

// Subscribe to push notifications
router.post('/', validateJWT, requireInstitution, (req, res) => pushSubscriptionController.subscribe(req, res));

// Unsubscribe from push notifications
router.delete('/:endpoint', validateJWT, requireInstitution, (req, res) => pushSubscriptionController.unsubscribe(req, res));

// Send bulk notification (admin only)
router.post('/send', validateJWT, requireInstitution, (req, res) => pushSubscriptionController.sendBulkNotification(req, res));

export default router;
