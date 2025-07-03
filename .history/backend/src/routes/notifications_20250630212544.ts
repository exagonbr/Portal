import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Endpoints para gerenciamento de notificações
 */

// Email verification routes
router.get(
  '/email/verify',
  authMiddleware,
  NotificationController.verifyEmailConfiguration
);

router.post(
  '/email/verify',
  authMiddleware,
  NotificationController.sendVerificationEmail
);

// Core notification routes
router.get(
  '/',
  authMiddleware,
  NotificationController.getNotifications
);

router.get(
  '/sent',
  authMiddleware,
  NotificationController.getSentNotifications
);

router.get(
  '/:id',
  authMiddleware,
  NotificationController.getNotificationById
);

router.post(
  '/',
  authMiddleware,
  NotificationController.createNotification
);

router.post(
  '/send',
  authMiddleware,
  NotificationController.sendNotification
);

router.patch(
  '/:id',
  authMiddleware,
  NotificationController.updateNotification
);

router.delete(
  '/:id',
  authMiddleware,
  NotificationController.deleteNotification
);

// Notification actions
router.patch(
  '/:id/read',
  authMiddleware,
  NotificationController.markAsRead
);

router.patch(
  '/bulk/read',
  authMiddleware,
  NotificationController.markMultipleAsRead
);

router.patch(
  '/all/read',
  authMiddleware,
  NotificationController.markAllAsRead
);

router.delete(
  '/bulk',
  authMiddleware,
  NotificationController.deleteBulkNotifications
);

// Notification stats and management
router.get(
  '/:id/stats',
  authMiddleware,
  NotificationController.getNotificationStats
);

router.patch(
  '/:id/cancel',
  authMiddleware,
  NotificationController.cancelScheduledNotification
);

router.patch(
  '/:id/reschedule',
  authMiddleware,
  NotificationController.rescheduleNotification
);

router.post(
  '/:id/send-now',
  authMiddleware,
  NotificationController.sendDraftNotification
);

// Cleanup and maintenance
router.post(
  '/cleanup',
  authMiddleware,
  NotificationController.cleanupOldNotifications
);

export default router;