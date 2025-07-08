import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { EducationCycle, EducationLevel } from '../entities/EducationCycle';
import { Class } from '../entities/Class';

export interface CreateEducationCycleData extends Omit<EducationCycle, 'id' | 'created_at' | 'updated_at' | 'classes' | 'total_students' | 'total_teachers'> {}
export interface UpdateEducationCycleData extends Partial<CreateEducationCycleData> {}

export interface EducationCycleFilters {
  search?: string;
  level?: EducationLevel;
  page?: number;
  limit?: number;
  sortBy?: keyof EducationCycle;
  sortOrder?: 'asc' | 'desc';
}

export class EducationCycleRepository extends ExtendedRepository<EducationCycle> {
  constructor() {
    super('education_cycles');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<EducationCycle>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('educationcycle');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('educationcycle.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('educationcycle.id', 'DESC')
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
          SELECT * FROM educationcycle
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM educationcycle
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
      console.error(`Erro ao buscar registros de educationcycle:`, error);
      throw error;
    }
  }

  async createCycle(data: CreateEducationCycleData): Promise<EducationCycle> {
    return this.create(data);
  }

  async updateCycle(id: string, data: UpdateEducationCycleData): Promise<EducationCycle | null> {
    return this.update(id, data);
  }

  async findByLevel(level: EducationLevel): Promise<EducationCycle[]> {
    return this.findAll({ level } as Partial<EducationCycle>);
  }

  async findWithFilters(filters: EducationCycleFilters): Promise<{ data: EducationCycle[], total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      ...otherFilters
    } = filters;

    const query = this.db(this.tableName).select('*');
    const countQuery = this.db(this.tableName).count('* as total').first();

    if (search) {
      query.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`);
      });
      countQuery.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`);
      });
    }

    if (Object.keys(otherFilters).length > 0) {
        query.where(otherFilters);
        countQuery.where(otherFilters);
    }
    
    query.orderBy(sortBy, sortOrder).limit(limit).offset((page - 1) * limit);

    const [data, totalResult] = await Promise.all([query, countQuery]);
    
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;

    return { data, total };
  }

  async getClasses(cycleId: string): Promise<Class[]> {
    return this.db('classes')
      .select('classes.*')
      .innerJoin('class_education_cycles', 'classes.id', 'class_education_cycles.class_id')
      .where('class_education_cycles.education_cycle_id', cycleId);
  }

  async addClass(cycleId: string, classId: string): Promise<void> {
    await this.db('class_education_cycles').insert({ education_cycle_id: cycleId, class_id: classId });
  }

  async removeClass(cycleId: string, classId: string): Promise<boolean> {
    const deletedRows = await this.db('class_education_cycles')
      .where({ education_cycle_id: cycleId, class_id: classId })
      .del();
    return deletedRows > 0;
  }
}