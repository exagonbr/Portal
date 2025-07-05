import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import NotificationController from '../controllers/NotificationController';

const router = Router();

router.use(requireAuth);

router.get('/', NotificationController.getNotifications);
router.post('/', NotificationController.createNotification);
router.get('/:id', NotificationController.getNotificationById);
router.patch('/:id/read', NotificationController.markAsRead);
router.patch('/all/read', NotificationController.markAllAsRead);

export default router;