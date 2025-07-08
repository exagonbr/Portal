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
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select('*');
      
      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike('name', `%${search}%`);
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
            qb.whereILike('name', `%${search}%`);
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