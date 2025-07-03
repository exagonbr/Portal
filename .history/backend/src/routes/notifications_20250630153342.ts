import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import { isAuthenticated } from '../middleware/auth'; // Supondo que um middleware de autenticação exista

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Endpoints para gerenciamento de notificações
 */

router.post(
  '/email/verify',
  isAuthenticated, // Protegendo a rota
  NotificationController.sendVerificationEmail
);

export default router;