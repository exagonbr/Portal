import express from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// Middleware para verificar permissão de notificações
const requireNotificationPermission = (req: any, res: any, next: any) => {
  // Para simplificar, permitir todos os usuários autenticados se inscreverem
  // Implementação de permissões específicas pode ser adicionada depois
  next();
};

// Middleware para verificar permissão de envio
const requireSendPermission = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem enviar notificações'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/push-subscription:
 *   post:
 *     summary: Subscribe to push notifications
 *     tags: [PushNotifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *               - keys
 *             properties:
 *               endpoint:
 *                 type: string
 *               keys:
 *                 type: object
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                   auth:
 *                     type: string
 *     responses:
 *       201:
 *         description: Subscription created
 *       400:
 *         description: Invalid input
 */
router.post('/', requireNotificationPermission, async (req, res) => {
  // Implementation will be added in the controller
  res.status(201).json({
    success: true,
    message: 'Push subscription - implementação pendente'
  });
});

/**
 * @swagger
 * /api/push-subscription/{endpoint}:
 *   delete:
 *     summary: Unsubscribe from push notifications
 *     tags: [PushNotifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: endpoint
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription removed
 *       404:
 *         description: Subscription not found
 */
router.delete('/:endpoint', requireNotificationPermission, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Push unsubscription - implementação pendente'
  });
});

/**
 * @swagger
 * /api/push-subscription/send:
 *   post:
 *     summary: Send bulk push notification
 *     tags: [PushNotifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               icon:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notifications sent
 *       400:
 *         description: Invalid input
 */
router.post('/send', requireSendPermission, async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Send bulk notification - implementação pendente'
  });
});

export default router;
