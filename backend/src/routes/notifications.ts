import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import { requireAuth } from '../middleware/requireAuth';
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

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Endpoints para gerenciamento de notificações
 */

// Email verification routes
router.get(
  '/email/verify',
  NotificationController.verifyEmailConfiguration
);

router.post(
  '/email/verify',
  NotificationController.sendVerificationEmail
);

// Core notification routes
router.get(
  '/',
  validateNotificationQuery,
  NotificationController.getNotifications
);

router.get(
  '/sent',
  checkSentNotificationsPermissions,
  validateNotificationQuery,
  NotificationController.getSentNotifications
);

router.get(
  '/:id',
  validateNotificationId,
  NotificationController.getNotificationById
);

router.post(
  '/',
  checkNotificationPermissions,
  validateCreateNotification,
  NotificationController.createNotification
);

router.post(
  '/send',
  checkNotificationPermissions,
  validateSendNotification,
  NotificationController.sendNotification
);

router.patch(
  '/:id',
  checkNotificationPermissions,
  validateUpdateNotification,
  NotificationController.updateNotification
);

router.delete(
  '/:id',
  validateNotificationId,
  NotificationController.deleteNotification
);

// Notification actions
router.patch(
  '/:id/read',
  validateNotificationId,
  NotificationController.markAsRead
);

router.patch(
  '/bulk/read',
  validateBulkIds,
  NotificationController.markMultipleAsRead
);

router.patch(
  '/all/read',
  NotificationController.markAllAsRead
);

router.delete(
  '/bulk',
  validateBulkIds,
  NotificationController.deleteBulkNotifications
);

router.post(
  '/bulk/delete',
  validateBulkIds,
  NotificationController.deleteBulkNotifications
);

// Notification stats and management
router.get(
  '/:id/stats',
  checkSentNotificationsPermissions,
  validateNotificationId,
  NotificationController.getNotificationStats
);

router.patch(
  '/:id/cancel',
  checkNotificationPermissions,
  validateNotificationId,
  NotificationController.cancelScheduledNotification
);

router.patch(
  '/:id/reschedule',
  checkNotificationPermissions,
  validateReschedule,
  NotificationController.rescheduleNotification
);

router.post(
  '/:id/send-now',
  checkNotificationPermissions,
  validateNotificationId,
  NotificationController.sendDraftNotification
);

// Cleanup and maintenance
router.post(
  '/cleanup',
  checkNotificationPermissions,
  validateCleanup,
  NotificationController.cleanupOldNotifications
);

export default router;