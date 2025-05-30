import express from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
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
router.post('/send', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
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
router.post('/email/test', validateJWT, requireRole(['admin']), async (req, res) => {
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
      return res.status(400).json({
        success: false,
        message: 'Email service is not enabled',
        error: status.error
      });
    }

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
      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email - check server logs for details'
      });
    }
  } catch (error) {
    console.error('Error in email test route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error'
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
router.get('/email/verify', validateJWT, requireRole(['admin']), async (req, res) => {
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

export default router; 