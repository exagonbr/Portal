import { Request, Response } from 'express';
import { emailService } from '../services/emailService';
import { notificationLogService, NotificationType } from '../services/NotificationLogService';
import { notificationService as notificationManagementService } from '../services/NotificationManagementService';
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
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
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
        user_id: authenticatedUser.id,
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
          success: true,
          message: 'Verification email sent.',
          data: {
            recipient: user.email,
            status: 'success',
            logId: logId
          }
        });
      } else {
        // Marcar como falhado
        await notificationLogService.markAsFailed(logId, 'Email service returned false - SMTP configuration issue');
        
        res.status(500).json({
          success: false,
          message: 'Failed to send verification email.'
        });
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      
      // Marcar como falhado se temos o logId
      if (logId) {
        await notificationLogService.markAsFailed(logId, error instanceof Error ? error.message : 'Unknown error');
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
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

      console.log('📧 [NotificationController] Dados recebidos:', {
        title,
        message: message?.substring(0, 50) + '...',
        type,
        category,
        priority,
        sendPush,
        sendEmail,
        recipients
      });

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

      // Validação específica para envio por email
      if (sendEmail) {
        if (!recipients || !recipients.emails || !Array.isArray(recipients.emails) || recipients.emails.length === 0) {
          res.status(400).json({
            success: false,
            message: 'Para envio por email, é necessário especificar pelo menos um destinatário válido'
          });
          return;
        }

        // Validar formato dos emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = recipients.emails.filter((email: string) => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
          res.status(400).json({
            success: false,
            message: `Emails inválidos encontrados: ${invalidEmails.join(', ')}`
          });
          return;
        }
      }

      // Usar o novo serviço de notificações
      const result = await notificationManagementService.sendNotification({
        title,
        message,
        type,
        category,
        priority,
        senderId: authenticatedUser.id,
        recipients: {
          userIds: recipients?.userIds || [],
          emails: recipients?.emails || [],
          roles: recipients?.roles || []
        },
        channels: {
          push: sendPush || false,
          email: sendEmail || false,
          inApp: true // Sempre enviar notificação in-app
        }
      });

      res.status(200).json({
        success: true,
        message: 'Notificação enviada com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao enviar notificação'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications:
   *   get:
   *     summary: Busca notificações do usuário atual
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [academic, system, social, administrative]
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [info, warning, success, error]
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [all, read, unread]
   *     responses:
   *       200:
   *         description: Lista de notificações
   */
  public async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { page = 1, limit = 10, category, type, status, unread_only } = req.query;

      const result = await notificationManagementService.getNotifications(
        authenticatedUser.id,
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          category: category as string,
          type: type as string,
          status: status as string,
          unread_only: unread_only === 'true'
        }
      );

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/sent:
   *   get:
   *     summary: Busca notificações enviadas pelo usuário atual
   */
  public async getSentNotifications(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { page = 1, limit = 10, status } = req.query;

      const result = await notificationManagementService.getSentNotifications(
        authenticatedUser.id,
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          status: status as string
        }
      );

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Erro ao buscar notificações enviadas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/{id}:
   *   get:
   *     summary: Busca uma notificação específica por ID
   */
  public async getNotificationById(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { id } = req.params;

      // Simular busca por ID
      const mockNotification = {
        id: parseInt(id),
        title: 'Notificação de teste',
        message: 'Esta é uma notificação de exemplo.',
        type: 'info',
        category: 'system',
        priority: 'medium',
        read: false,
        created_at: new Date().toISOString(),
        sender_name: 'Sistema'
      };

      res.status(200).json({
        success: true,
        data: mockNotification
      });

    } catch (error) {
      console.error('Erro ao buscar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications:
   *   post:
   *     summary: Cria uma nova notificação
   */
  public async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { title, message, type, category, priority, recipients, scheduledFor } = req.body;

      if (!title || !message || !type || !category || !priority) {
        res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: title, message, type, category, priority'
        });
        return;
      }

      // Simular criação de notificação
      const newNotification = {
        id: Date.now(),
        title,
        message,
        type,
        category,
        priority,
        status: scheduledFor ? 'scheduled' : 'draft',
        scheduledFor,
        recipients: recipients || { total: 0, read: 0, unread: 0 },
        sentBy: authenticatedUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'Notificação criada com sucesso',
        data: newNotification
      });

    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/{id}:
   *   patch:
   *     summary: Atualiza uma notificação existente
   */
  public async updateNotification(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { id } = req.params;
      const updates = req.body;

      // Simular atualização
      const updatedNotification = {
        id: parseInt(id),
        ...updates,
        updated_at: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        message: 'Notificação atualizada com sucesso',
        data: updatedNotification
      });

    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/{id}:
   *   delete:
   *     summary: Deleta uma notificação
   */
  public async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Simular deleção
      res.status(200).json({
        success: true,
        message: 'Notificação deletada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/{id}/read:
   *   patch:
   *     summary: Marca uma notificação como lida
   */
  public async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Simular marcação como lida
      res.status(200).json({
        success: true,
        message: 'Notificação marcada como lida'
      });

    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/bulk/read:
   *   patch:
   *     summary: Marca múltiplas notificações como lidas
   */
  public async markMultipleAsRead(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { ids } = req.body;

      if (!ids || !Array.isArray(ids)) {
        res.status(400).json({
          success: false,
          message: 'IDs das notificações são obrigatórios'
        });
        return;
      }

      // Simular marcação múltipla como lida
      res.status(200).json({
        success: true,
        message: `${ids.length} notificações marcadas como lidas`
      });

    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/all/read:
   *   patch:
   *     summary: Marca todas as notificações como lidas
   */
  public async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Simular marcação de todas como lidas
      res.status(200).json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas'
      });

    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/bulk:
   *   delete:
   *     summary: Deleta múltiplas notificações
   */
  public async deleteBulkNotifications(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { ids } = req.body;

      if (!ids || !Array.isArray(ids)) {
        res.status(400).json({
          success: false,
          message: 'IDs das notificações são obrigatórios'
        });
        return;
      }

      // Simular deleção múltipla
      res.status(200).json({
        success: true,
        message: `${ids.length} notificações deletadas com sucesso`
      });

    } catch (error) {
      console.error('Erro ao deletar notificações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/{id}/stats:
   *   get:
   *     summary: Busca estatísticas de uma notificação
   */
  public async getNotificationStats(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { id } = req.params;

      // Simular estatísticas
      const stats = {
        id: parseInt(id),
        recipients: {
          total: 100,
          delivered: 95,
          read: 75,
          unread: 20,
          failed: 5
        },
        engagement: {
          openRate: 75,
          clickRate: 25
        },
        deliveryMethods: {
          email: 50,
          push: 45,
          inApp: 100
        }
      };

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas da notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/{id}/cancel:
   *   patch:
   *     summary: Cancela uma notificação agendada
   */
  public async cancelScheduledNotification(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Simular cancelamento
      res.status(200).json({
        success: true,
        message: 'Notificação agendada cancelada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao cancelar notificação agendada:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/{id}/reschedule:
   *   patch:
   *     summary: Reagenda uma notificação
   */
  public async rescheduleNotification(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { id } = req.params;
      const { scheduledFor } = req.body;

      if (!scheduledFor) {
        res.status(400).json({
          success: false,
          message: 'Data de agendamento é obrigatória'
        });
        return;
      }

      // Simular reagendamento
      res.status(200).json({
        success: true,
        message: 'Notificação reagendada com sucesso',
        data: {
          id: parseInt(id),
          scheduledFor,
          status: 'scheduled'
        }
      });

    } catch (error) {
      console.error('Erro ao reagendar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/{id}/send-now:
   *   post:
   *     summary: Envia um rascunho de notificação imediatamente
   */
  public async sendDraftNotification(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { id } = req.params;

      // Simular envio imediato
      res.status(200).json({
        success: true,
        message: 'Notificação enviada com sucesso',
        data: {
          id: parseInt(id),
          status: 'sent',
          sentAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/notifications/cleanup:
   *   post:
   *     summary: Remove notificações antigas
   */
  public async cleanupOldNotifications(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedUser = req.user as AuthTokenPayload;
      if (!authenticatedUser) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { olderThan = 30 } = req.body; // dias

      // Simular limpeza
      const deletedCount = Math.floor(Math.random() * 100);

      res.status(200).json({
        success: true,
        message: `${deletedCount} notificações antigas foram removidas`,
        data: {
          deletedCount,
          olderThan
        }
      });

    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default new NotificationController();