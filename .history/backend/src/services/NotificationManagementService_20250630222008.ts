import { NotificationRepository } from '../repositories/NotificationRepository';
import {
  Notification,
  CreateNotificationData,
  UpdateNotificationData,
  NotificationFilters,
  NotificationWithSender,
  BulkNotificationData
} from '../models/Notification';
import { emailService } from './emailService';
import { notificationLogService, NotificationType } from './NotificationLogService';
import { QueueService } from './queueService';

// Definir interface de resposta paginada localmente
export interface PaginatedResponseDto<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  unreadCount?: number;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  type?: string;
  status?: string;
  priority?: string;
  from_date?: string;
  to_date?: string;
  unread_only?: boolean;
}

class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  /**
   * Busca notificações do usuário com filtros e paginação
   */
  async getNotifications(
    recipientId: string,
    params: NotificationQueryParams
  ): Promise<PaginatedResponseDto<NotificationWithSender>> {
    const {
      page = 1,
      limit = 10,
      category,
      type,
      status,
      unread_only
    } = params;

    const filters: NotificationFilters = {
      category: category !== 'all' ? category : undefined,
      type: type !== 'all' ? type : undefined,
      status: status !== 'all' ? status : undefined,
      unread_only: unread_only || false
    };

    const offset = (page - 1) * limit;
    const notifications = await this.notificationRepository.findByRecipient(
      recipientId,
      filters,
      limit,
      offset
    );

    // Contar total para paginação
    const totalCount = await this.countNotificationsByRecipient(recipientId, filters);
    const unreadCount = await this.notificationRepository.countUnreadByRecipient(recipientId);

    return {
      items: notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      unreadCount
    };
  }

  /**
   * Busca notificações enviadas pelo usuário
   */
  async getSentNotifications(
    senderId: string,
    params: NotificationQueryParams
  ): Promise<PaginatedResponseDto<NotificationWithSender>> {
    const {
      page = 1,
      limit = 10,
      status
    } = params;

    const filters: NotificationFilters = {
      sender_id: senderId,
      status: status !== 'all' ? status : undefined
    };

    const offset = (page - 1) * limit;
    
    // Implementar método no repository para buscar por sender_id
    const notifications = await this.findBySender(senderId, filters, limit, offset);
    const totalCount = await this.countNotificationsBySender(senderId, filters);

    return {
      items: notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Busca uma notificação específica por ID
   */
  async getNotificationById(id: string, userId: string): Promise<NotificationWithSender | null> {
    const notification = await this.notificationRepository.findById(id);
    
    if (!notification) {
      return null;
    }

    // Verificar se o usuário tem permissão para ver a notificação
    if (notification.recipient_id !== userId && notification.sender_id !== userId) {
      throw new Error('Sem permissão para visualizar esta notificação');
    }

    return notification;
  }

  /**
   * Cria uma nova notificação
   */
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const notification = await this.notificationRepository.create(data);

    // Se tem agendamento, agendar para envio futuro
    if (data.scheduled_for && data.scheduled_for > new Date()) {
      await this.scheduleNotification(notification.id, data.scheduled_for);
    } else {
      // Enviar imediatamente
      await this.processNotificationDelivery(notification);
    }

    return notification;
  }

  /**
   * Atualiza uma notificação existente
   */
  async updateNotification(id: string, data: UpdateNotificationData, userId: string): Promise<Notification | null> {
    const existingNotification = await this.notificationRepository.findById(id);
    
    if (!existingNotification) {
      throw new Error('Notificação não encontrada');
    }

    if (existingNotification.sender_id !== userId) {
      throw new Error('Sem permissão para editar esta notificação');
    }

    const updatedNotification = await this.notificationRepository.update(id, data);
    return updatedNotification;
  }

  /**
   * Deleta uma notificação
   */
  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const notification = await this.notificationRepository.findById(id);
    
    if (!notification) {
      throw new Error('Notificação não encontrada');
    }

    // Verificar permissões
    if (notification.recipient_id !== userId && notification.sender_id !== userId) {
      throw new Error('Sem permissão para deletar esta notificação');
    }

    return await this.notificationRepository.delete(id);
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string, userId: string): Promise<boolean> {
    return await this.notificationRepository.markAsRead(id, userId);
  }

  /**
   * Marca múltiplas notificações como lidas
   */
  async markMultipleAsRead(ids: string[], userId: string): Promise<number> {
    return await this.notificationRepository.markMultipleAsRead(ids, userId);
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<number> {
    return await this.notificationRepository.markAllAsRead(userId);
  }

  /**
   * Deleta múltiplas notificações
   */
  async deleteBulkNotifications(ids: string[], userId: string): Promise<number> {
    return await this.notificationRepository.deleteNotifications(ids, userId);
  }

  /**
   * Busca estatísticas de uma notificação
   */
  async getNotificationStats(id: string, userId: string): Promise<any> {
    const notification = await this.notificationRepository.findById(id);
    
    if (!notification) {
      throw new Error('Notificação não encontrada');
    }

    if (notification.sender_id !== userId) {
      throw new Error('Sem permissão para ver estatísticas desta notificação');
    }

    // Implementar lógica de estatísticas
    return {
      id,
      recipients: {
        total: 100, // Implementar contagem real
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
  }

  /**
   * Cancela uma notificação agendada
   */
  async cancelScheduledNotification(id: string, userId: string): Promise<boolean> {
    const notification = await this.notificationRepository.findById(id);
    
    if (!notification) {
      throw new Error('Notificação não encontrada');
    }

    if (notification.sender_id !== userId) {
      throw new Error('Sem permissão para cancelar esta notificação');
    }

    if (notification.status !== 'scheduled') {
      throw new Error('Apenas notificações agendadas podem ser canceladas');
    }

    return await this.notificationRepository.updateStatus(id, 'failed');
  }

  /**
   * Reagenda uma notificação
   */
  async rescheduleNotification(id: string, newDate: Date, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findById(id);
    
    if (!notification) {
      throw new Error('Notificação não encontrada');
    }

    if (notification.sender_id !== userId) {
      throw new Error('Sem permissão para reagendar esta notificação');
    }

    const updateData: UpdateNotificationData = {
      scheduled_for: newDate,
      status: 'scheduled'
    };

    const updatedNotification = await this.notificationRepository.update(id, updateData);
    
    if (updatedNotification) {
      await this.scheduleNotification(id, newDate);
    }

    return updatedNotification;
  }

  /**
   * Envia um rascunho de notificação imediatamente
   */
  async sendDraftNotification(id: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findById(id);
    
    if (!notification) {
      throw new Error('Notificação não encontrada');
    }

    if (notification.sender_id !== userId) {
      throw new Error('Sem permissão para enviar esta notificação');
    }

    if (notification.status !== 'pending') {
      throw new Error('Apenas notificações pendentes podem ser enviadas');
    }

    // Atualizar status e processar entrega
    const updatedNotification = await this.notificationRepository.updateStatus(id, 'pending', new Date());
    
    if (updatedNotification) {
      await this.processNotificationDelivery(notification);
    }

    return await this.notificationRepository.findById(id);
  }

  /**
   * Remove notificações antigas
   */
  async cleanupOldNotifications(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Implementar limpeza no repository
    // Por enquanto, simular
    return Math.floor(Math.random() * 100);
  }

  /**
   * Cria notificações em massa
   */
  async createBulkNotifications(data: BulkNotificationData): Promise<Notification[]> {
    const notifications: CreateNotificationData[] = [];

    // Expandir destinatários baseado no tipo
    if (data.recipients.type === 'all') {
      // Implementar lógica para todos os usuários
      notifications.push({
        ...data,
        recipient_type: 'all',
        recipient_id: undefined
      });
    } else if (data.recipients.type === 'role' && data.recipients.roles) {
      // Criar uma notificação por role
      for (const role of data.recipients.roles) {
        notifications.push({
          ...data,
          recipient_type: 'role',
          recipient_roles: [role],
          recipient_id: undefined
        });
      }
    } else if (data.recipients.type === 'specific' && data.recipients.user_ids) {
      // Criar uma notificação por usuário
      for (const userId of data.recipients.user_ids) {
        notifications.push({
          ...data,
          recipient_type: 'specific',
          recipient_id: userId,
          recipient_roles: undefined
        });
      }
    }

    return await this.notificationRepository.createBulkNotifications(notifications);
  }

  // Métodos privados auxiliares

  private async countNotificationsByRecipient(recipientId: string, filters: NotificationFilters): Promise<number> {
    // Implementar contagem no repository
    return 0; // Placeholder
  }

  private async countNotificationsBySender(senderId: string, filters: NotificationFilters): Promise<number> {
    // Implementar contagem no repository
    return 0; // Placeholder
  }

  private async findBySender(senderId: string, filters: NotificationFilters, limit: number, offset: number): Promise<NotificationWithSender[]> {
    // Implementar busca por sender no repository
    return []; // Placeholder
  }

  private async scheduleNotification(notificationId: string, scheduledFor: Date): Promise<void> {
    // Agendar no sistema de filas
    const delay = scheduledFor.getTime() - Date.now();
    
    if (delay > 0) {
      const queueService = QueueService.getInstance();
      await queueService.addJob(
        'notification:send',
        { notificationId },
        { delay }
      );
    }
  }

  private async processNotificationDelivery(notification: Notification): Promise<void> {
    try {
      // Processar entrega baseado nos métodos configurados
      for (const method of notification.delivery_methods) {
        switch (method) {
          case 'email':
            await this.sendEmailNotification(notification);
            break;
          case 'push':
            await this.sendPushNotification(notification);
            break;
          case 'in_app':
            // Notificação in-app já está salva no banco
            break;
        }
      }

      // Atualizar status para enviado
      await this.notificationRepository.updateStatus(notification.id, 'sent', new Date());

    } catch (error) {
      console.error('Erro ao processar entrega da notificação:', error);
      await this.notificationRepository.updateStatus(notification.id, 'failed');
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    // Implementar envio de email
    console.log('Enviando notificação por email:', notification.id);
    
    // Criar log de notificação
    await notificationLogService.create({
      type: NotificationType.EMAIL,
      recipient: 'recipient@example.com', // Buscar email real do destinatário
      subject: notification.title,
      template_name: 'notification-email',
      user_id: notification.sender_id,
      provider: 'Gmail SMTP',
      metadata: {
        notificationId: notification.id,
        category: notification.category,
        priority: notification.priority
      }
    });
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    // Implementar envio de push notification
    console.log('Enviando push notification:', notification.id);
    
    // Integrar com serviço de push notifications
    // await pushNotificationService.send({
    //   title: notification.title,
    //   body: notification.message,
    //   userId: notification.recipient_id
    // });
  }
  /**
   * Envia uma notificação imediatamente
   */
  async sendNotification(data: {
    title: string;
    message: string;
    type: string;
    category: string;
    priority: string;
    senderId: string;
    recipients: {
      userIds: string[];
      emails: string[];
      roles: string[];
    };
    channels: {
      push: boolean;
      email: boolean;
      inApp: boolean;
    };
  }): Promise<{
    notificationId: string;
    recipientCount: number;
    sentAt: string;
    methods: {
      push: boolean;
      email: boolean;
    };
  }> {
    // Calcular contagem de destinatários
    let recipientCount = 0;
    recipientCount += data.recipients.userIds.length;
    recipientCount += data.recipients.emails.length;
    recipientCount += data.recipients.roles.length * 10; // Estimativa por role

    if (recipientCount === 0) {
      recipientCount = 100; // Broadcast para todos
    }

    // Criar notificação no banco
    const notificationData: CreateNotificationData = {
      title: data.title,
      message: data.message,
      type: data.type as any,
      category: data.category as any,
      priority: data.priority as any,
      sender_id: data.senderId,
      recipient_type: recipientCount > 1 ? 'all' : 'specific',
      recipient_id: data.recipients.userIds[0] || undefined,
      recipient_roles: data.recipients.roles.length > 0 ? data.recipients.roles : undefined,
      delivery_methods: [
        ...(data.channels.email ? ['email'] : []),
        ...(data.channels.push ? ['push'] : []),
        ...(data.channels.inApp ? ['in_app'] : [])
      ] as any[],
      metadata: {
        recipients: data.recipients,
        channels: data.channels
      }
    };

    const notification = await this.createNotification(notificationData);

    // Processar envio de emails se solicitado
    if (data.channels.email && data.recipients.emails.length > 0) {
      for (const email of data.recipients.emails) {
        try {
          await emailService.sendEmail({
            to: email,
            subject: data.title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">${data.title}</h2>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; line-height: 1.6;">${data.message}</p>
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                  <p>Esta é uma notificação automática do Portal Sabercon.</p>
                  <p>Categoria: ${data.category} | Prioridade: ${data.priority}</p>
                </div>
              </div>
            `,
            from: process.env.SMTP_FROM_EMAIL || 'noreply@sabercon.com.br'
          });
        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError);
        }
      }
    }

    return {
      notificationId: notification.id,
      recipientCount,
      sentAt: new Date().toISOString(),
      methods: {
        push: data.channels.push,
        email: data.channels.email
      }
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
