import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Language } from '../entities/Language';

export interface CreateLanguageData {
  name: string;
  code: string;
  isActive?: boolean;
}

export interface UpdateLanguageData extends Partial<CreateLanguageData> {}

export class LanguageRepository extends ExtendedRepository<Language> {
  constructor() {
    super('language');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Language>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('language');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('language.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('language.id', 'DESC')
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
          SELECT * FROM language
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM language
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
      console.error(`Erro ao buscar registros de language:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<Language | null> {
    const language = await this.findById(id);
    if (!language) return null;
    
    return this.update(id, { isActive: !language.isActive });
  }

  async findByCode(code: string): Promise<Language | null> {
    return this.db(this.tableName)
      .where('code', code)
      .first();
  }

  async findActive(): Promise<Language[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }

  async findByName(name: string): Promise<Language[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }
} 