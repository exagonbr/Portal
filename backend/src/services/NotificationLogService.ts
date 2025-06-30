import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced'
}

export interface NotificationLog {
  id: string;
  type: NotificationType;
  recipient: string;
  subject?: string;
  message?: string;
  template_name?: string;
  verification_token?: string;
  user_id?: string;
  status: NotificationStatus;
  provider?: string;
  provider_message_id?: string;
  provider_response?: any;
  error_message?: string;
  retry_count: number;
  scheduled_at?: Date;
  sent_at?: Date;
  delivered_at?: Date;
  opened_at?: Date;
  clicked_at?: Date;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNotificationLogData {
  type: NotificationType;
  recipient: string;
  subject?: string;
  message?: string;
  template_name?: string;
  verification_token?: string;
  user_id?: string;
  provider?: string;
  scheduled_at?: Date;
  metadata?: any;
}

export interface UpdateNotificationLogData {
  status?: NotificationStatus;
  provider_message_id?: string;
  provider_response?: any;
  error_message?: string;
  retry_count?: number;
  sent_at?: Date;
  delivered_at?: Date;
  opened_at?: Date;
  clicked_at?: Date;
  metadata?: any;
}

class NotificationLogService {
  private tableName = 'notification_logs';

  /**
   * Cria um novo log de notificação
   */
  async create(data: CreateNotificationLogData): Promise<NotificationLog> {
    const id = uuidv4();
    const now = new Date();

    const logData = {
      id,
      ...data,
      status: NotificationStatus.PENDING,
      retry_count: 0,
      created_at: now,
      updated_at: now
    };

    await db(this.tableName).insert(logData);
    return await this.findById(id) as NotificationLog;
  }

  /**
   * Atualiza um log de notificação existente
   */
  async update(id: string, data: UpdateNotificationLogData): Promise<NotificationLog | null> {
    const updateData = {
      ...data,
      updated_at: new Date()
    };

    await db(this.tableName)
      .where({ id })
      .update(updateData);

    return await this.findById(id);
  }

  /**
   * Busca um log por ID
   */
  async findById(id: string): Promise<NotificationLog | null> {
    const result = await db(this.tableName)
      .where({ id })
      .first();

    return result || null;
  }

  /**
   * Busca logs por token de verificação
   */
  async findByVerificationToken(token: string): Promise<NotificationLog[]> {
    return await db(this.tableName)
      .where({ verification_token: token })
      .orderBy('created_at', 'desc');
  }

  /**
   * Busca logs por destinatário
   */
  async findByRecipient(recipient: string, type?: NotificationType): Promise<NotificationLog[]> {
    let query = db(this.tableName).where({ recipient });
    
    if (type) {
      query = query.andWhere({ type });
    }

    return await query.orderBy('created_at', 'desc');
  }

  /**
   * Busca logs por usuário
   */
  async findByUserId(userId: string, type?: NotificationType): Promise<NotificationLog[]> {
    let query = db(this.tableName).where({ user_id: userId });
    
    if (type) {
      query = query.andWhere({ type });
    }

    return await query.orderBy('created_at', 'desc');
  }

  /**
   * Busca logs por status
   */
  async findByStatus(status: NotificationStatus, type?: NotificationType): Promise<NotificationLog[]> {
    let query = db(this.tableName).where({ status });
    
    if (type) {
      query = query.andWhere({ type });
    }

    return await query.orderBy('created_at', 'desc');
  }

  /**
   * Marca um log como enviado
   */
  async markAsSent(id: string, providerMessageId?: string, providerResponse?: any): Promise<NotificationLog | null> {
    return await this.update(id, {
      status: NotificationStatus.SENT,
      sent_at: new Date(),
      provider_message_id: providerMessageId,
      provider_response: providerResponse
    });
  }

  /**
   * Marca um log como entregue
   */
  async markAsDelivered(id: string): Promise<NotificationLog | null> {
    return await this.update(id, {
      status: NotificationStatus.DELIVERED,
      delivered_at: new Date()
    });
  }

  /**
   * Marca um log como falhado
   */
  async markAsFailed(id: string, errorMessage: string): Promise<NotificationLog | null> {
    return await this.update(id, {
      status: NotificationStatus.FAILED,
      error_message: errorMessage
    });
  }

  /**
   * Incrementa o contador de tentativas
   */
  async incrementRetryCount(id: string): Promise<NotificationLog | null> {
    const log = await this.findById(id);
    if (!log) return null;

    return await this.update(id, {
      retry_count: log.retry_count + 1
    });
  }

  /**
   * Registra abertura de email
   */
  async markAsOpened(id: string): Promise<NotificationLog | null> {
    return await this.update(id, {
      opened_at: new Date()
    });
  }

  /**
   * Registra clique em link do email
   */
  async markAsClicked(id: string): Promise<NotificationLog | null> {
    return await this.update(id, {
      clicked_at: new Date()
    });
  }

  /**
   * Busca estatísticas de notificações
   */
  async getStats(type?: NotificationType, startDate?: Date, endDate?: Date) {
    let query = db(this.tableName);

    if (type) {
      query = query.where({ type });
    }

    if (startDate) {
      query = query.andWhere('created_at', '>=', startDate);
    }

    if (endDate) {
      query = query.andWhere('created_at', '<=', endDate);
    }

    const [total, sent, delivered, failed, pending] = await Promise.all([
      query.clone().count('* as count').first().then(r => parseInt(r?.count as string) || 0),
      query.clone().where({ status: NotificationStatus.SENT }).count('* as count').first().then(r => parseInt(r?.count as string) || 0),
      query.clone().where({ status: NotificationStatus.DELIVERED }).count('* as count').first().then(r => parseInt(r?.count as string) || 0),
      query.clone().where({ status: NotificationStatus.FAILED }).count('* as count').first().then(r => parseInt(r?.count as string) || 0),
      query.clone().where({ status: NotificationStatus.PENDING }).count('* as count').first().then(r => parseInt(r?.count as string) || 0)
    ]);

    return {
      total,
      sent,
      delivered,
      failed,
      pending,
      successRate: total > 0 ? ((sent + delivered) / total * 100).toFixed(2) : '0.00'
    };
  }

  /**
   * Remove logs antigos (limpeza)
   */
  async cleanupOldLogs(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db(this.tableName)
      .where('created_at', '<', cutoffDate)
      .del();

    return result;
  }

  /**
   * Lista logs com paginação
   */
  async list(options: {
    page?: number;
    limit?: number;
    type?: NotificationType;
    status?: NotificationStatus;
    recipient?: string;
    userId?: string;
  } = {}): Promise<{ data: NotificationLog[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50, type, status, recipient, userId } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName);

    if (type) {
      query = query.where({ type });
    }

    if (status) {
      query = query.where({ status });
    }

    if (recipient) {
      query = query.where({ recipient });
    }

    if (userId) {
      query = query.where({ user_id: userId });
    }

    const [data, totalResult] = await Promise.all([
      query.clone()
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      query.clone().count('* as count').first()
    ]);

    const total = parseInt(totalResult?.count as string) || 0;

    return {
      data,
      total,
      page,
      limit
    };
  }
}

export const notificationLogService = new NotificationLogService();