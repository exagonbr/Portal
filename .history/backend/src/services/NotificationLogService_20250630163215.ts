import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { NotificationLog, NotificationType, NotificationStatus } from '../entities/NotificationLog';

export interface CreateNotificationLogData {
  type: NotificationType;
  recipient: string;
  subject?: string;
  message?: string;
  templateName?: string;
  verificationToken?: string;
  userId?: string;
  provider?: string;
  scheduledAt?: Date;
  metadata?: any;
}

export interface UpdateNotificationLogData {
  status?: NotificationStatus;
  providerMessageId?: string;
  providerResponse?: any;
  errorMessage?: string;
  retryCount?: number;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  metadata?: any;
}

class NotificationLogService {
  private repository: Repository<NotificationLog>;

  constructor() {
    this.repository = AppDataSource.getRepository(NotificationLog);
  }

  /**
   * Cria um novo log de notificação
   */
  async create(data: CreateNotificationLogData): Promise<NotificationLog> {
    const log = this.repository.create({
      ...data,
      status: NotificationStatus.PENDING,
      retryCount: 0
    });

    return await this.repository.save(log);
  }

  /**
   * Atualiza um log de notificação existente
   */
  async update(id: string, data: UpdateNotificationLogData): Promise<NotificationLog | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  /**
   * Busca um log por ID
   */
  async findById(id: string): Promise<NotificationLog | null> {
    return await this.repository.findOne({ where: { id } });
  }

  /**
   * Busca logs por token de verificação
   */
  async findByVerificationToken(token: string): Promise<NotificationLog[]> {
    return await this.repository.find({
      where: { verificationToken: token },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Busca logs por destinatário
   */
  async findByRecipient(recipient: string, type?: NotificationType): Promise<NotificationLog[]> {
    const where: any = { recipient };
    if (type) {
      where.type = type;
    }

    return await this.repository.find({
      where,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Busca logs por usuário
   */
  async findByUserId(userId: string, type?: NotificationType): Promise<NotificationLog[]> {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    return await this.repository.find({
      where,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Busca logs por status
   */
  async findByStatus(status: NotificationStatus, type?: NotificationType): Promise<NotificationLog[]> {
    const where: any = { status };
    if (type) {
      where.type = type;
    }

    return await this.repository.find({
      where,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Marca um log como enviado
   */
  async markAsSent(id: string, providerMessageId?: string, providerResponse?: any): Promise<NotificationLog | null> {
    return await this.update(id, {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      providerMessageId,
      providerResponse
    });
  }

  /**
   * Marca um log como entregue
   */
  async markAsDelivered(id: string): Promise<NotificationLog | null> {
    return await this.update(id, {
      status: NotificationStatus.DELIVERED,
      deliveredAt: new Date()
    });
  }

  /**
   * Marca um log como falhado
   */
  async markAsFailed(id: string, errorMessage: string): Promise<NotificationLog | null> {
    return await this.update(id, {
      status: NotificationStatus.FAILED,
      errorMessage
    });
  }

  /**
   * Incrementa o contador de tentativas
   */
  async incrementRetryCount(id: string): Promise<NotificationLog | null> {
    const log = await this.findById(id);
    if (!log) return null;

    return await this.update(id, {
      retryCount: log.retryCount + 1
    });
  }

  /**
   * Registra abertura de email
   */
  async markAsOpened(id: string): Promise<NotificationLog | null> {
    return await this.update(id, {
      openedAt: new Date()
    });
  }

  /**
   * Registra clique em link do email
   */
  async markAsClicked(id: string): Promise<NotificationLog | null> {
    return await this.update(id, {
      clickedAt: new Date()
    });
  }

  /**
   * Busca estatísticas de notificações
   */
  async getStats(type?: NotificationType, startDate?: Date, endDate?: Date) {
    const queryBuilder = this.repository.createQueryBuilder('log');

    if (type) {
      queryBuilder.andWhere('log.type = :type', { type });
    }

    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    const [total, sent, delivered, failed, pending] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('log.status = :status', { status: NotificationStatus.SENT }).getCount(),
      queryBuilder.clone().andWhere('log.status = :status', { status: NotificationStatus.DELIVERED }).getCount(),
      queryBuilder.clone().andWhere('log.status = :status', { status: NotificationStatus.FAILED }).getCount(),
      queryBuilder.clone().andWhere('log.status = :status', { status: NotificationStatus.PENDING }).getCount()
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

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}

export const notificationLogService = new NotificationLogService();