import { BaseRepository } from './BaseRepository';
import { 
  Notification,
  CreateNotificationData,
  NotificationFilters,
  NotificationWithSender,
  NotificationStats
} from '../models/Notification';

export class NotificationRepository extends BaseRepository<Notification> {
  
  constructor() {
    super('notifications');
  }

  override async create(data: CreateNotificationData): Promise<Notification> {
    const notificationData = {
      ...data,
      recipient_roles: JSON.stringify(data.recipient_roles || []),
      delivery_methods: JSON.stringify(data.delivery_methods),
      metadata: JSON.stringify(data.metadata || {}),
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    const [result] = await this.db(this.tableName)
      .insert(notificationData)
      .returning('*');
    
    return this.mapNotification(result);
  }

  override async findById(id: string): Promise<NotificationWithSender | null> {
    const result = await this.db(this.tableName)
      .leftJoin('User', 'notifications.sender_id', 'User.id')
      .select(
        'notifications.*',
        'User.name as sender_name',
        'User.email as sender_email'
      )
      .where('notifications.id', id)
      .first();
    
    return result ? this.mapNotificationWithSender(result) : null;
  }

  async findByRecipient(
    recipientId: string, 
    filters?: NotificationFilters,
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationWithSender[]> {
    let query = this.db(this.tableName)
      .leftJoin('User', 'notifications.sender_id', 'User.id')
      .select(
        'notifications.*',
        'User.name as sender_name',
        'User.email as sender_email'
      )
      .where('notifications.recipient_id', recipientId);

    if (filters) {
      if (filters.category && filters.category !== 'all') {
        query = query.where('notifications.category', filters.category);
      }

      if (filters.type && filters.type !== 'all') {
        query = query.where('notifications.type', filters.type);
      }

      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'unread') {
          query = query.whereNull('notifications.read_at');
        } else if (filters.status === 'read') {
          query = query.whereNotNull('notifications.read_at');
        } else {
          query = query.where('notifications.status', filters.status);
        }
      }

      if (filters.unread_only) {
        query = query.whereNull('notifications.read_at');
      }
    }

    const results = await query
      .orderBy('notifications.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return results.map(row => this.mapNotificationWithSender(row));
  }

  async findUnreadByRecipient(recipientId: string): Promise<NotificationWithSender[]> {
    const results = await this.db(this.tableName)
      .leftJoin('User', 'notifications.sender_id', 'User.id')
      .select(
        'notifications.*',
        'User.name as sender_name',
        'User.email as sender_email'
      )
      .where('notifications.recipient_id', recipientId)
      .whereNull('notifications.read_at')
      .orderBy('notifications.created_at', 'desc');

    return results.map(row => this.mapNotificationWithSender(row));
  }

  async countUnreadByRecipient(recipientId: string): Promise<number> {
    const result = await this.db(this.tableName)
      .where('recipient_id', recipientId)
      .whereNull('read_at')
      .count('* as count')
      .first();
    
    return parseInt(result?.count as string) || 0;
  }

  async findScheduledNotifications(): Promise<Notification[]> {
    const results = await this.db(this.tableName)
      .where('status', 'scheduled')
      .where('scheduled_for', '<=', new Date())
      .orderBy('scheduled_for', 'asc');

    return results.map(row => this.mapNotification(row));
  }

  async findPendingNotifications(): Promise<Notification[]> {
    const results = await this.db(this.tableName)
      .where('status', 'pending')
      .orderBy([
        { column: 'priority', order: 'desc' },
        { column: 'created_at', order: 'asc' }
      ]);

    return results.map(row => this.mapNotification(row));
  }

  async markAsRead(id: string, recipientId: string): Promise<boolean> {
    const updatedRows = await this.db(this.tableName)
      .where('id', id)
      .where('recipient_id', recipientId)
      .whereNull('read_at')
      .update({
        read_at: new Date(),
        updated_at: new Date()
      });
    
    return updatedRows > 0;
  }

  async markMultipleAsRead(ids: string[], recipientId: string): Promise<number> {
    const updatedRows = await this.db(this.tableName)
      .whereIn('id', ids)
      .where('recipient_id', recipientId)
      .whereNull('read_at')
      .update({
        read_at: new Date(),
        updated_at: new Date()
      });
    
    return updatedRows;
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    const updatedRows = await this.db(this.tableName)
      .where('recipient_id', recipientId)
      .whereNull('read_at')
      .update({
        read_at: new Date(),
        updated_at: new Date()
      });
    
    return updatedRows;
  }

  async updateStatus(id: string, status: string, sentAt?: Date): Promise<boolean> {
    const updateData: any = {
      status,
      updated_at: new Date()
    };

    if (sentAt) {
      updateData.sent_at = sentAt;
    }

    const updatedRows = await this.db(this.tableName)
      .where('id', id)
      .update(updateData);
    
    return updatedRows > 0;
  }

  async deleteNotifications(ids: string[], recipientId: string): Promise<number> {
    const deletedRows = await this.db(this.tableName)
      .whereIn('id', ids)
      .where('recipient_id', recipientId)
      .del();
    
    return deletedRows;
  }

  async getStatsByRecipient(recipientId: string): Promise<NotificationStats> {
    const result = await this.db(this.tableName)
      .where('recipient_id', recipientId)
      .select(
        this.db.raw('COUNT(*) as total'),
        this.db.raw('COUNT(CASE WHEN read_at IS NULL THEN 1 END) as unread'),
        this.db.raw("COUNT(CASE WHEN type = 'info' THEN 1 END) as info_count"),
        this.db.raw("COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning_count"),
        this.db.raw("COUNT(CASE WHEN type = 'success' THEN 1 END) as success_count"),
        this.db.raw("COUNT(CASE WHEN type = 'error' THEN 1 END) as error_count"),
        this.db.raw("COUNT(CASE WHEN category = 'academic' THEN 1 END) as academic_count"),
        this.db.raw("COUNT(CASE WHEN category = 'system' THEN 1 END) as system_count"),
        this.db.raw("COUNT(CASE WHEN category = 'social' THEN 1 END) as social_count"),
        this.db.raw("COUNT(CASE WHEN category = 'administrative' THEN 1 END) as administrative_count"),
        this.db.raw("COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count"),
        this.db.raw("COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count"),
        this.db.raw("COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count"),
        this.db.raw("COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count"),
        this.db.raw("COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count")
      )
      .first();

    return {
      total: parseInt(result.total),
      unread: parseInt(result.unread),
      by_type: {
        info: parseInt(result.info_count),
        warning: parseInt(result.warning_count),
        success: parseInt(result.success_count),
        error: parseInt(result.error_count)
      },
      by_category: {
        academic: parseInt(result.academic_count),
        system: parseInt(result.system_count),
        social: parseInt(result.social_count),
        administrative: parseInt(result.administrative_count)
      },
      by_status: {
        pending: parseInt(result.pending_count),
        scheduled: parseInt(result.scheduled_count),
        sent: parseInt(result.sent_count),
        delivered: parseInt(result.delivered_count),
        failed: parseInt(result.failed_count)
      }
    };
  }

  async createBulkNotifications(notifications: CreateNotificationData[]): Promise<Notification[]> {
    if (notifications.length === 0) return [];

    const notificationsData = notifications.map(notification => ({
      ...notification,
      recipient_roles: JSON.stringify(notification.recipient_roles || []),
      delivery_methods: JSON.stringify(notification.delivery_methods),
      metadata: JSON.stringify(notification.metadata || {}),
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    }));

    const results = await this.db(this.tableName)
      .insert(notificationsData)
      .returning('*');

    return results.map(row => this.mapNotification(row));
  }

  async findByRecipientType(
    recipientType: 'all' | 'role' | 'specific',
    recipientRoles?: string[],
    limit: number = 100
  ): Promise<Notification[]> {
    let query = this.db(this.tableName)
      .where('recipient_type', recipientType)
      .where('status', 'pending');

    if (recipientType === 'role' && recipientRoles && recipientRoles.length > 0) {
      // Para PostgreSQL, usar operador de array
      query = query.whereRaw('recipient_roles::jsonb ?| array[?]', [recipientRoles]);
    }

    const results = await query
      .orderBy([
        { column: 'priority', order: 'desc' },
        { column: 'created_at', order: 'asc' }
      ])
      .limit(limit);

    return results.map(row => this.mapNotification(row));
  }

  private mapNotification(row: any): Notification {
    return {
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type,
      category: row.category,
      priority: row.priority,
      sender_id: row.sender_id,
      recipient_id: row.recipient_id,
      recipient_type: row.recipient_type,
      recipient_roles: row.recipient_roles ? JSON.parse(row.recipient_roles) : [],
      delivery_methods: JSON.parse(row.delivery_methods),
      scheduled_for: row.scheduled_for,
      sent_at: row.sent_at,
      read_at: row.read_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private mapNotificationWithSender(row: any): NotificationWithSender {
    const notification = this.mapNotification(row);
    return {
      ...notification,
      sender_name: row.sender_name,
      sender_email: row.sender_email
    };
  }
}

export default NotificationRepository;