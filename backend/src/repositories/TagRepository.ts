import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Tag } from '../entities/Tag';

export interface CreateTagData {
  name: string;
  deleted?: boolean;
}

export interface UpdateTagData extends Partial<CreateTagData> {}

export class TagRepository extends ExtendedRepository<Tag> {
  constructor() {
    super('tag');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Tag>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('tag');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('tag.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('tag.id', 'DESC')
          .getManyAndCount();
          
        return {
          data,
          total,
          page,
          limit
        };
      } else {
        // Fallback para query raw
        const query = `
          SELECT * FROM tag
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM tag
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
        `;

        const [data, countResult] = await Promise.all([
          AppDataSource.query(query),
          AppDataSource.query(countQuery)
        ]);

        const total = parseInt(countResult[0].total);

        return {
          data,
          total,
          page,
          limit
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar registros de tag:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Tag[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<Tag[]> {
    return this.db(this.tableName)
      .where('deleted', false)
      .orderBy('name', 'asc');
  }

  async findByExactName(name: string): Promise<Tag | null> {
    return this.db(this.tableName)
      .where('name', name)
      .andWhere('deleted', false)
      .first();
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.update(id, { deleted: true });
    return !!result;
  }
} 