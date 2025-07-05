import { BaseRepository } from './BaseRepository';
import { Notification, NotificationCategory, NotificationStatus, NotificationType } from '../entities/Notification';

export interface CreateNotificationData extends Omit<Notification, 'id' | 'created_at' | 'updated_at' | 'sentBy'> {}

export interface NotificationFilters {
    category?: NotificationCategory;
    type?: NotificationType;
    status?: 'read' | 'unread' | NotificationStatus;
    unread_only?: boolean;
}

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super('notifications');
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    return this.create(data);
  }

  async findByRecipient(recipientId: string, filters: NotificationFilters = {}, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    let query = this.db(this.tableName).where({ recipient_id: recipientId }); // Supondo que a entidade tenha recipient_id

    if (filters.category) {
        query.where({ category: filters.category });
    }
    if (filters.type) {
        query.where({ type: filters.type });
    }
    if (filters.status) {
        if (filters.status === 'read') {
            query.whereNotNull('read_at'); // Supondo que a entidade tenha read_at
        } else if (filters.status === 'unread') {
            query.whereNull('read_at');
        } else {
            query.where({ status: filters.status });
        }
    }
    if (filters.unread_only) {
        query.whereNull('read_at');
    }

    return query.orderBy('created_at', 'desc').limit(limit).offset(offset);
  }

  async countUnread(recipientId: string): Promise<number> {
    const result = await this.db(this.tableName)
        .where({ recipient_id: recipientId })
        .whereNull('read_at')
        .count('* as count')
        .first();
    return parseInt(result?.count as string, 10) || 0;
  }

  async markAsRead(id: string, recipientId: string): Promise<boolean> {
    const updatedRows = await this.db(this.tableName)
        .where({ id, recipient_id: recipientId })
        .update({ read_at: new Date() });
    return updatedRows > 0;
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    const updatedRows = await this.db(this.tableName)
        .where({ recipient_id: recipientId })
        .whereNull('read_at')
        .update({ read_at: new Date() });
    return updatedRows;
  }
}