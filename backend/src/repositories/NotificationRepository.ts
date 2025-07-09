import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Notification, NotificationCategory, NotificationStatus, NotificationType } from '../entities/Notification';
import { AppDataSource } from '../config/typeorm.config';
import { Repository } from 'typeorm';

export interface CreateNotificationData extends Omit<Notification, 'id' | 'created_at' | 'updated_at' | 'sentBy'> {}

export interface NotificationFilters {
    category?: NotificationCategory;
    type?: NotificationType;
    status?: 'read' | 'unread' | NotificationStatus;
    unread_only?: boolean;
}

export class NotificationRepository extends ExtendedRepository<Notification> {
  constructor() {
    super("notifications");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Notification>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select("*");

      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike("name", `%${search}%`);
      }

      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy("id", "DESC")
        .limit(limit)
        .offset(offset);

      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count("* as total")
        .modify(qb => {
          if (search) {
            qb.whereILike("name", `%${search}%`);
          }
        })
        .first();

      const total = parseInt(countResult?.total as string, 10) || 0;

      return {
        data,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error(`Erro ao buscar registros de notificações:`, error);
      throw error;
    }
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
