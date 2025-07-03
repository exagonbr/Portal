import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  validateCreateNotification,
  validateUpdateNotification,
  validateNotificationQuery,
  validateNotificationId,
  validateBulkIds,
  validateReschedule,
  validateCleanup,
  validateSendNotification,
  checkNotificationPermissions,
  checkSentNotificationsPermissions
} from '../middleware/notificationValidation';

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
  validateNotificationQuery,
  NotificationController.getNotifications
);

router.get(
  '/sent',
  authMiddleware,
  checkSentNotificationsPermissions,
  validateNotificationQuery,
  NotificationController.getSentNotifications
);

router.get(
  '/:id',
  authMiddleware,
  validateNotificationId,
  NotificationController.getNotificationById
);

router.post(
  '/',
  authMiddleware,
  checkNotificationPermissions,
  validateCreateNotification,
  NotificationController.createNotification
);

router.post(
  '/send',
  authMiddleware,
  checkNotificationPermissions,
  validateSendNotification,
  NotificationController.sendNotification
);

router.patch(
  '/:id',
  authMiddleware,
  checkNotificationPermissions,
  validateUpdateNotification,
  NotificationController.updateNotification
);

router.delete(
  '/:id',
  authMiddleware,
  validateNotificationId,
  NotificationController.deleteNotification
);

// Notification actions
router.patch(
  '/:id/read',
  authMiddleware,
  validateNotificationId,
  NotificationController.markAsRead
);

router.patch(
  '/bulk/read',
  authMiddleware,
  validateBulkIds,
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
  validateBulkIds,
  NotificationController.deleteBulkNotifications
);

router.post(
  '/bulk/delete',
  authMiddleware,
  validateBulkIds,
  NotificationController.deleteBulkNotifications
);

// Notification stats and management
router.get(
  '/:id/stats',
  authMiddleware,
  checkSentNotificationsPermissions,
  validateNotificationId,
  NotificationController.getNotificationStats
);

router.patch(
  '/:id/cancel',
  authMiddleware,
  checkNotificationPermissions,
  validateNotificationId,
  NotificationController.cancelScheduledNotification
);

router.patch(
  '/:id/reschedule',
  authMiddleware,
  checkNotificationPermissions,
  validateReschedule,
  NotificationController.rescheduleNotification
);

router.post(
  '/:id/send-now',
  authMiddleware,
  checkNotificationPermissions,
  validateNotificationId,
  NotificationController.sendDraftNotification
);

// Cleanup and maintenance
router.post(
  '/cleanup',
  authMiddleware,
  checkNotificationPermissions,
  validateCleanup,
  NotificationController.cleanupOldNotifications
);

export default router;