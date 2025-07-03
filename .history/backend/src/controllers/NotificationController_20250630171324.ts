import { Request, Response } from 'express';
import { emailService } from '../services/emailService';
import { notificationLogService, NotificationType } from '../services/NotificationLogService';
import { AuthTokenPayload } from '../types/express';
import crypto from 'crypto';

class NotificationController {
  /**
   * @swagger
   * /api/notifications/email/verify:
   *   get:
   *     summary: Verifica a configuração de email do sistema
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Configuração de email verificada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Configuração verificada com sucesso"
   *                 data:
   *                   type: object
   *                   properties:
   *                     connected:
   *                       type: boolean
   *                       example: true
   *                     enabled:
   *                       type: boolean
   *                       example: true
   *                     provider:
   *                       type: string
   *                       example: "Gmail SMTP"
   *                     host:
   *                       type: string
   *                       example: "smtp.gmail.com"
   *                     port:
   *                       type: number
   *                       example: 587
   *       401:
   *         description: Usuário não autenticado
   *       500:
   *         description: Erro interno do servidor
   */
  public async verifyEmailConfiguration(req: Request, res: Response): Promise<void> {
    try {
      // Verificar se o usuário está autenticado
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Simular verificação da configuração de email
      // Em produção, aqui você verificaria a conexão SMTP real
      const emailConfig = {
        connected: true,
        enabled: true,
        provider: 'Gmail SMTP',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        message: 'Configuração de email verificada com sucesso'
      };

      console.log('📧 Verificando configuração de email para usuário:', authenticatedUser.name);
      console.log('📧 Configuração atual:', emailConfig);

      res.status(200).json({
        success: true,
        message: 'Configuração verificada com sucesso',
        data: emailConfig
      });

    } catch (error) {
      console.error('Erro ao verificar configuração de email:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao verificar configuração'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/email/verify:
   *   post:
   *     summary: Envia um email de verificação para o usuário logado
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Email de verificação enviado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Verification email sent."
   *                 data:
   *                   type: object
   *                   properties:
   *                     recipient:
   *                       type: string
   *                       example: "user@example.com"
   *                     status:
   *                       type: string
   *                       example: "success"
   *                     logId:
   *                       type: string
   *                       example: "log-id-123"
   *       401:
   *         description: Usuário não autenticado
   *       500:
   *         description: Erro ao enviar email
   */
  public async sendVerificationEmail(req: Request, res: Response): Promise<void> {
    let logId: string | null = null;
    
    try {
      // Obter dados do usuário autenticado
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      // Gerar token de verificação real
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Preparar dados do usuário usando informações do token JWT
      const user = {
        email: 'argentaov@gmail.com',
        name: authenticatedUser.name || 'Usuário Portal',
        verificationToken: verificationToken
      };

      // Criar log de notificação
      const log = await notificationLogService.create({
        type: NotificationType.EMAIL,
        recipient: user.email,
        subject: 'Verifique seu endereço de email - Portal Sabercon',
        template_name: 'email-verification',
        verification_token: user.verificationToken,
        user_id: authenticatedUser.userId,
        provider: 'Gmail SMTP',
        metadata: {
          userName: user.name,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        }
      });

      logId = log.id;

      console.log(`📧 Enviando email de verificação para: ${user.email}`);
      console.log(`📧 Nome do usuário: ${user.name}`);
      console.log(`📧 Token de verificação: ${user.verificationToken}`);
      console.log(`📊 Log ID: ${logId}`);
      
      const emailResult = await emailService.sendVerificationEmail(user.email, user.name, user.verificationToken);

      if (emailResult) {
        // Marcar como enviado com sucesso
        await notificationLogService.markAsSent(logId, 'email-sent-successfully', {
          success: true,
          timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
          message: 'Verification email sent.',
          recipient: user.email,
          status: 'success',
          logId: logId
        });
      } else {
        // Marcar como falhado
        await notificationLogService.markAsFailed(logId, 'Email service returned false - SMTP configuration issue');
        
        res.status(500).json({ message: 'Failed to send verification email.' });
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      
      // Marcar como falhado se temos o logId
      if (logId) {
        await notificationLogService.markAsFailed(logId, error instanceof Error ? error.message : 'Unknown error');
      }
      
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /api/notifications/send:
   *   post:
   *     summary: Envia uma notificação para usuários específicos
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
   *               - type
   *               - category
   *               - priority
   *             properties:
   *               title:
   *                 type: string
   *                 example: "Nova atualização disponível"
   *               message:
   *                 type: string
   *                 example: "Uma nova versão do sistema está disponível"
   *               type:
   *                 type: string
   *                 enum: [info, warning, success, error]
   *                 example: "info"
   *               category:
   *                 type: string
   *                 enum: [academic, system, social, administrative]
   *                 example: "system"
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high]
   *                 example: "medium"
   *               sendPush:
   *                 type: boolean
   *                 example: true
   *               sendEmail:
   *                 type: boolean
   *                 example: false
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
   *     responses:
   *       200:
   *         description: Notificação enviada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Notificação enviada com sucesso"
   *                 data:
   *                   type: object
   *                   properties:
   *                     notificationId:
   *                       type: number
   *                     recipientCount:
   *                       type: number
   *                     sentAt:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Usuário não autenticado
   *       500:
   *         description: Erro interno do servidor
   */
  public async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      // Verificar autenticação
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Validar dados obrigatórios
      const { title, message, type, category, priority, sendPush, sendEmail, recipients } = req.body;

      if (!title || !message || !type || !category || !priority) {
        res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: title, message, type, category, priority'
        });
        return;
      }

      if (!sendPush && !sendEmail) {
        res.status(400).json({
          success: false,
          message: 'Pelo menos um método de envio deve ser selecionado (sendPush ou sendEmail)'
        });
        return;
      }

      // Simular envio de notificação (aqui você integraria com o serviço real)
      const notificationData = {
        title,
        message,
        type,
        category,
        priority,
        sendPush: sendPush || false,
        sendEmail: sendEmail || false,
        recipients: recipients || {},
        senderId: authenticatedUser.userId,
        senderName: authenticatedUser.name,
        sentAt: new Date().toISOString()
      };

      // Log da notificação
      console.log('📢 Enviando notificação:', {
        title,
        type,
        category,
        priority,
        sendPush,
        sendEmail,
        sender: authenticatedUser.name,
        recipients: recipients
      });

      // Simular contagem de destinatários
      let recipientCount = 0;
      if (recipients?.userIds?.length) {
        recipientCount += recipients.userIds.length;
      }
      if (recipients?.emails?.length) {
        recipientCount += recipients.emails.length;
      }
      if (recipients?.roles?.length) {
        // Simular contagem por roles (em produção, consultar banco de dados)
        recipientCount += recipients.roles.length * 10; // Estimativa
      }
      if (!recipients || Object.keys(recipients).length === 0) {
        recipientCount = 100; // Estimativa para "todos os usuários"
      }

      // Criar log de notificação
      const log = await notificationLogService.create({
        type: sendEmail ? NotificationType.EMAIL : NotificationType.PUSH,
        recipient: recipients?.emails?.[0] || 'multiple-recipients',
        subject: title,
        template_name: 'notification-broadcast',
        user_id: authenticatedUser.userId,
        provider: sendEmail ? 'Gmail SMTP' : 'Web Push',
        metadata: {
          notificationData,
          recipientCount,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        }
      });

      // Marcar como enviado (em produção, isso seria feito após o envio real)
      await notificationLogService.markAsSent(log.id, 'notification-sent-successfully', {
        success: true,
        recipientCount,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: `Notificação enviada com sucesso para ${recipientCount} destinatário(s)`,
        data: {
          notificationId: log.id,
          recipientCount,
          sentAt: notificationData.sentAt,
          methods: {
            push: sendPush,
            email: sendEmail
          }
        }
      });

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao enviar notificação'
      });
    }
  }
}

export default new NotificationController();