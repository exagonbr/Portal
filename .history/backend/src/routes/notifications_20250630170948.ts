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

router.post(
  '/email/verify',
  authMiddleware, // Protegendo a rota
  NotificationController.sendVerificationEmail
);

router.post(
  '/send',
  authMiddleware, // Protegendo a rota
  NotificationController.sendNotification
);

export default router;