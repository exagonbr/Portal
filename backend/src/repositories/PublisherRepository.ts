import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Publisher } from '../entities/Publisher';
import { AppDataSource } from '../config/typeorm.config';
import { Repository } from 'typeorm';

export interface CreatePublisherData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdatePublisherData extends Partial<CreatePublisherData> {}

export class PublisherRepository extends ExtendedRepository<Publisher> {
  private repository: Repository<Publisher>;
  constructor() {
    super("publishers");
    this.repository = AppDataSource.getRepository(Publisher);
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Publisher>> {
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
      console.error(`Erro ao buscar registros de publisher:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<Publisher | null> {
    const publisher = await this.findById(id);
    if (!publisher) return null;
    
    return this.update(id, { isActive: !publisher.isActive });
  }

  async findByName(name: string): Promise<Publisher[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<Publisher[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }
} 
