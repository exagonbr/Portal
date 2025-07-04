import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', NotificationController.getNotifications);
router.patch('/:id/read', NotificationController.markAsRead);
router.patch('/all/read', NotificationController.markAllAsRead);

export default router;