import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Subject } from '../entities/Subject';

export interface CreateSubjectData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {}

export class SubjectRepository extends ExtendedRepository<Subject> {
  constructor() {
    super('subject');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Subject>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('subject');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('subject.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('subject.id', 'DESC')
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
          SELECT * FROM subject
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM subject
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
      console.error(`Erro ao buscar registros de subject:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<Subject | null> {
    const subject = await this.findById(id);
    if (!subject) return null;
    
    return this.update(id, { isActive: !subject.isActive });
  }

  async findByName(name: string): Promise<Subject[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<Subject[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }
} 