import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { NotificationTemplate } from '../entities/NotificationTemplate';

export interface CreateNotificationTemplateData extends Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'creator'> {}

export interface UpdateNotificationTemplateData extends Partial<Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'creator'>> {}

export interface NotificationTemplateFilter {
  name?: string;
  category?: string;
  isPublic?: boolean;
  userId?: number;
  createdBy?: string;
}

export class NotificationTemplateRepository extends ExtendedRepository<NotificationTemplate> {
  constructor() {
    super('notification_templates');
  }

  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<NotificationTemplate>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      let query = this.db(this.tableName).select("*");

      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike("name", `%${search}%`)
          .orWhereILike("subject", `%${search}%`)
          .orWhereILike("category", `%${search}%`);
      }

      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy("created_at", "DESC")
        .limit(limit)
        .offset(offset);

      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count("* as total")
        .modify(qb => {
          if (search) {
            qb.whereILike("name", `%${search}%`)
              .orWhereILike("subject", `%${search}%`)
              .orWhereILike("category", `%${search}%`);
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
      throw error;
    }
  }

  async findByName(name: string): Promise<NotificationTemplate | null> {
    return this.findOne({ name } as Partial<NotificationTemplate>);
  }

  async findByCategory(category: string): Promise<NotificationTemplate[]> {
    return this.findAll({ category } as Partial<NotificationTemplate>);
  }

  async findPublicTemplates(): Promise<NotificationTemplate[]> {
    return this.findAll({ isPublic: true } as Partial<NotificationTemplate>);
  }

  async findByUserId(userId: string): Promise<NotificationTemplate[]> {
    return this.findAll({ userId: parseInt(userId, 10) } as Partial<NotificationTemplate>);
  }

  async createTemplate(data: CreateNotificationTemplateData): Promise<NotificationTemplate> {
    console.log('🔍 [Template Repository] Dados recebidos:', data);
    
    // Mapear os dados para o formato do banco
    const insertData = {
      name: data.name,
      subject: data.subject,
      message: data.message,
      html: data.html,
      category: data.category,
      is_public: data.isPublic,
      user_id: data.userId,
      created_by: data.createdBy,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('🔍 [Template Repository] Dados para INSERT:', insertData);
    
    const result = await this.create(insertData);
    console.log('✅ [Template Repository] Template criado:', result);
    
    return result;
  }

  async updateTemplate(id: string, data: UpdateNotificationTemplateData): Promise<NotificationTemplate | null> {
    return this.update(id, data);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.db(this.tableName)
      .distinct('category')
      .select('category')
      .whereNotNull('category');
    
    return result.map(r => r.category);
  }

  async findPaginated(
    page: number = 1,
    limit: number = 10,
    filters: NotificationTemplateFilter = {}
  ): Promise<PaginatedResult<NotificationTemplate>> {
    try {
      let query = this.db(this.tableName).select("*");

      // Aplicar filtros
      if (filters.name) {
        query = query.whereILike("name", `%${filters.name}%`);
      }

      if (filters.category) {
        query = query.where("category", filters.category);
      }

      if (filters.isPublic !== undefined) {
        query = query.where("is_public", filters.isPublic);
      }

      if (filters.userId) {
        query = query.where("user_id", filters.userId);
      }

      if (filters.createdBy) {
        query = query.where("created_by", filters.createdBy);
      }

      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy("created_at", "DESC")
        .limit(limit)
        .offset(offset);

      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count("* as total")
        .modify(qb => {
          if (filters.name) {
            qb.whereILike("name", `%${filters.name}%`);
          }
          if (filters.category) {
            qb.where("category", filters.category);
          }
          if (filters.isPublic !== undefined) {
            qb.where("is_public", filters.isPublic);
          }
          if (filters.userId) {
            qb.where("user_id", filters.userId);
          }
          if (filters.createdBy) {
            qb.where("created_by", filters.createdBy);
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
      throw error;
    }
  }
} 