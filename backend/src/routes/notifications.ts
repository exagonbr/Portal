import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { pushSubscriptionController } from '../controllers/pushSubscriptionController';
import { emailService } from '../services/emailService';
import { getUserFromRequest } from '../utils/auth';

const router = express.Router();

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send notification (push and/or email)
 *     tags: [Notifications]
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
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [info, warning, success, error]
 *                 default: info
 *               category:
 *                 type: string
 *                 enum: [academic, system, social, administrative]
 *                 default: system
 *               recipients:
 *                 type: object
 *                 properties:
 *                   userIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   emails:
 *                     type: array
 *                     items:
 *                       type: string
 *                   roles:
 *                     type: array
 *                     items:
 *                       type: string
 *               sendPush:
 *                 type: boolean
 *                 default: true
 *               sendEmail:
 *                 type: boolean
 *                 default: false
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const {
      title,
      message,
      type = 'info',
      category = 'system',
      recipients = {},
      sendPush = true,
      sendEmail = false,
      priority = 'medium'
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    let pushSentCount = 0;
    let emailSentCount = 0;

    // Send push notifications
    if (sendPush && recipients.userIds && recipients.userIds.length > 0) {
      const payload = {
        title,
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon.svg',
        data: {
          type,
          category,
          priority,
          timestamp: new Date().toISOString()
        }
      };

      pushSentCount = await pushSubscriptionController.sendNotificationToUsers(
        recipients.userIds,
        payload
      );
    }

    // Send email notifications
    if (sendEmail && recipients.emails && recipients.emails.length > 0) {
      if (!emailService.isEnabled()) {
        console.log('⚠️  Envio de emails pulado: Serviço de email não está habilitado');
      } else {
        for (const email of recipients.emails) {
          const emailSent = await emailService.sendNotificationEmail(
            email,
            'Usuário', // Nome genérico, idealmente buscar do banco
            title,
            message
          );
          
          if (emailSent) {
            emailSentCount++;
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        pushSentCount,
        emailSentCount,
        totalRecipients: (recipients.userIds?.length || 0) + (recipients.emails?.length || 0)
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

/**
 * @swagger
 * /api/notifications/email/test:
 *   post:
 *     summary: Test email configuration
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *       400:
 *         description: Invalid email
 *       401:
 *         description: Unauthorized
 */
router.post('/email/test', authMiddleware, async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Verificar se o email está habilitado antes de tentar enviar
    if (!emailService.isEnabled()) {
      const status = emailService.getStatus();
      console.log('Email service not enabled:', status);
      return res.status(400).json({
        success: false,
        message: `Serviço de email não está habilitado: ${status.error || 'Configuração SMTP não encontrada'}`,
        error: status.error,
        details: 'Verifique as configurações SMTP no arquivo de ambiente'
      });
    }

    console.log(`Tentando enviar email de teste para: ${to}`);
    
    const emailSent = await emailService.sendEmail({
      to,
      subject: 'Teste de Configuração de Email - Portal Sabercon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Teste de Email</h1>
          <p>Este é um email de teste para verificar a configuração do servidor de email.</p>
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p>Se você recebeu este email, a configuração está funcionando corretamente!</p>
          <p>Atenciosamente,<br>Equipe Portal Sabercon</p>
        </div>
      `,
      text: 'Teste de configuração de email - Portal Sabercon'
    });

    if (emailSent) {
      console.log(`Email de teste enviado com sucesso para: ${to}`);
      return res.status(200).json({
        success: true,
        message: 'Email de teste enviado com sucesso'
      });
    } else {
      console.log(`Falha ao enviar email de teste para: ${to}`);
      const status = emailService.getStatus();
      return res.status(500).json({
        success: false,
        message: 'Falha ao enviar email de teste - verifique os logs do servidor para mais detalhes',
        error: status.error || 'Erro desconhecido no envio',
        details: 'O serviço de email pode não estar configurado corretamente'
      });
    }
  } catch (error) {
    console.error('Error in email test route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      message: `Erro ao enviar email de teste: ${errorMessage}`,
      error: errorMessage,
      details: 'Verifique as configurações do servidor de email'
    });
  }
});

/**
 * @swagger
 * /api/notifications/email/verify:
 *   get:
 *     summary: Verify email configuration
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email configuration status
 *       401:
 *         description: Unauthorized
 */
router.get('/email/verify', authMiddleware, async (req, res) => {
  try {
    const status = emailService.getStatus();
    const isConnected = await emailService.verifyConnection();

    return res.status(200).json({
      success: true,
      data: {
        enabled: status.enabled,
        connected: isConnected,
        error: status.error,
        message: status.enabled 
          ? (isConnected ? 'Email configuration is working correctly' : 'Email is configured but connection failed')
          : 'Email service is not enabled',
        details: status.error || 'No errors detected'
      }
    });
  } catch (error) {
    console.error('Error verifying email configuration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify email configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/notifications/push/test:
 *   post:
 *     summary: Test push notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to send test notification to (optional, defaults to current user)
 *     responses:
 *       200:
 *         description: Test push notification sent successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to send test notification
 */
router.post('/push/test', authMiddleware, async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { userId } = req.body;
    const targetUserId = userId || user.id.toString();

    const payload = {
      title: 'Teste de Push Notification',
      body: `Esta é uma notificação push de teste enviada em ${new Date().toLocaleString('pt-BR')}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon.svg',
      tag: 'test-notification',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
        url: '/notifications'
      }
    };

    const sentCount = await pushSubscriptionController.sendNotificationToUsers(
      [targetUserId],
      payload
    );

    if (sentCount > 0) {
      return res.status(200).json({
        success: true,
        message: 'Test push notification sent successfully',
        data: {
          sentCount,
          targetUserId,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'No push subscriptions found for user or push notification failed',
        data: {
          targetUserId,
          reason: 'User may not have push notifications enabled or subscription may be invalid'
        }
      });
    }
  } catch (error) {
    console.error('Error sending test push notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test push notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/notifications/push/verify:
 *   get:
 *     summary: Verify push notification configuration
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Push notification configuration status
 *       401:
 *         description: Unauthorized
 */
router.get('/push/verify', authMiddleware, async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user has active push subscriptions
    const subscriptions = await pushSubscriptionController.getUserSubscriptions(user.id.toString());
    const hasActiveSubscriptions = subscriptions && subscriptions.length > 0;

    // Check VAPID configuration
    const vapidConfigured = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

    return res.status(200).json({
      success: true,
      data: {
        vapidConfigured,
        hasActiveSubscriptions,
        subscriptionCount: subscriptions?.length || 0,
        message: vapidConfigured 
          ? (hasActiveSubscriptions 
              ? 'Push notifications are properly configured and user has active subscriptions' 
              : 'Push notifications are configured but user has no active subscriptions')
          : 'VAPID keys are not configured',
        details: {
          vapidPublicKey: vapidConfigured ? 'Configured' : 'Missing',
          vapidPrivateKey: vapidConfigured ? 'Configured' : 'Missing',
          userSubscriptions: hasActiveSubscriptions ? 'Active' : 'None'
        }
      }
    });
  } catch (error) {
    console.error('Error verifying push notification configuration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify push notification configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 