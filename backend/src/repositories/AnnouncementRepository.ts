import { AppDataSource } from "../config/typeorm.config";
import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Announcement } from '../entities/Announcement';

export interface CreateAnnouncementData {
  title: string;
  content: string;
  author_id: number;
  expires_at?: Date;
  priority?: 'baixa' | 'média' | 'alta' | 'urgente';
  scope: {
    type: 'global' | 'turma' | 'curso';
    targetId?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
  attachments?: any[];
}

export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {}

export class AnnouncementRepository extends ExtendedRepository<Announcement> {
  private repository: Repository<Announcement>;
  constructor() {
    super("announcements");
    this.repository = AppDataSource.getRepository(Announcement);
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Announcement>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select('*');
      
      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike('title', `%${search}%`);
      }
      
      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy('id', 'DESC')
        .limit(limit)
        .offset(offset);
      
      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count('* as total')
        .modify(qb => {
          if (search) {
            qb.whereILike('title', `%${search}%`);
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
      console.error(`Erro ao buscar registros de announcement:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<Announcement | null> {
    // Para announcements, podemos implementar uma lógica de ativo/inativo
    // ou usar a data de expiração
    const announcement = await this.findById(id);
    if (!announcement) return null;
    
    // Se tem data de expiração, remove ou define uma nova
    const expires_at = announcement.expires_at ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
    return this.update(id, { expires_at });
  }

  async findByAuthor(authorId: number): Promise<Announcement[]> {
    return this.db(this.tableName)
      .where('author_id', authorId)
      .orderBy('created_at', 'desc');
  }

  async findActive(): Promise<Announcement[]> {
    return this.db(this.tableName)
      .where(function() {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .orderBy('created_at', 'desc');
  }

  async findByScope(scopeType: 'global' | 'turma' | 'curso', targetId?: string): Promise<Announcement[]> {
    const query = this.db(this.tableName)
      .whereRaw("scope->>'type' = ?", [scopeType]);
    
    if (targetId) {
      query.whereRaw("scope->>'targetId' = ?", [targetId]);
    }
    
    return query.orderBy('created_at', 'desc');
  }
}