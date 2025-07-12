import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Tag } from '../entities/Tag';

export interface CreateTagData {
  name: string;
  deleted?: boolean;
}

export interface UpdateTagData extends Partial<CreateTagData> {}

export class TagRepository extends ExtendedRepository<Tag> {
  private repository: Repository<Tag>;
  constructor() {
    super("tags");
    this.repository = AppDataSource.getRepository(Tag);
  }
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Tag>> {
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
      console.error(`Erro ao buscar registros de tags:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Tag[]> {
    try {
      return this.db(this.tableName)
        .where('name', 'ilike', `%${name}%`)
        .andWhere('deleted', false)
        .orderBy('name', 'asc');
    } catch (error) {
      console.error(`Erro ao buscar tags por nome:`, error);
      throw error;
    }
  }

  async findActive(): Promise<Tag[]> {
    try {
      return this.db(this.tableName)
        .where('deleted', false)
        .orderBy('name', 'asc');
    } catch (error) {
      console.error(`Erro ao buscar tags ativas:`, error);
      throw error;
    }
  }

  async findByExactName(name: string): Promise<Tag | null> {
    try {
      return this.db(this.tableName)
        .where('name', name)
        .andWhere('deleted', false)
        .first();
    } catch (error) {
      console.error(`Erro ao buscar tag pelo nome exato:`, error);
      throw error;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      const result = await this.update(id, { deleted: true });
      return !!result;
    } catch (error) {
      console.error(`Erro ao deletar tag:`, error);
      throw error;
    }
  }
}
