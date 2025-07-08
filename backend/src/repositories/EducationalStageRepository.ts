import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { EducationalStage } from '../entities/EducationalStage';

export interface CreateEducationalStageData {
  name: string;
  uuid?: string;
  grade1?: boolean;
  grade2?: boolean;
  grade3?: boolean;
  grade4?: boolean;
  grade5?: boolean;
  grade6?: boolean;
  grade7?: boolean;
  grade8?: boolean;
  grade9?: boolean;
  deleted?: boolean;
}

export interface UpdateEducationalStageData extends Partial<CreateEducationalStageData> {}

export class EducationalStageRepository extends ExtendedRepository<EducationalStage> {
  constructor() {
    super('educational_stage');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<EducationalStage>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('educationalstage');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('educationalstage.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('educationalstage.id', 'DESC')
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
          SELECT * FROM educationalstage
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM educationalstage
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
      console.error(`Erro ao buscar registros de educationalstage:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<EducationalStage[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<EducationalStage[]> {
    return this.db(this.tableName)
      .where('deleted', false)
      .orderBy('name', 'asc');
  }

  async findByGrade(grade: number): Promise<EducationalStage[]> {
    const gradeColumn = `grade_${grade}`;
    return this.db(this.tableName)
      .where(gradeColumn, true)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findByUuid(uuid: string): Promise<EducationalStage | null> {
    return this.db(this.tableName)
      .where('uuid', uuid)
      .andWhere('deleted', false)
      .first();
  }
} 