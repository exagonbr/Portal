import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { School } from '../entities/School';

export interface CreateSchoolData extends Omit<School, 'id' | 'dateCreated' | 'lastUpdated' | 'institution' | 'total_students' | 'total_teachers' | 'total_classes' | 'total_managers' | 'active_classes'> {}
export interface UpdateSchoolData extends Partial<CreateSchoolData> {}

export interface SchoolFilters {
  search?: string;
  institutionId?: number;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: keyof School;
  sortOrder?: 'asc' | 'desc';
}

export class SchoolRepository extends ExtendedRepository<School> {
  constructor() {
    super('schools');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<School>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('school');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('school.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('school.id', 'DESC')
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
          SELECT * FROM school
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM school
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
      console.error(`Erro ao buscar registros de school:`, error);
      throw error;
    }
  }

  async createSchool(data: CreateSchoolData): Promise<School> {
    return this.create(data);
  }

  async updateSchool(id: number, data: UpdateSchoolData): Promise<School | null> {
    return this.update(id, data);
  }

  async findByName(name: string): Promise<School[]> {
    return this.db(this.tableName).where('name', 'ilike', `%${name}%`);
  }

  async findByInstitution(institutionId: number): Promise<School[]> {
    return this.findAll({ institutionId } as Partial<School>);
  }

  async findByState(state: string): Promise<School[]> {
    // A entidade School não possui 'state', a busca deveria ser feita na entidade Institution e depois buscar as escolas.
    // Esta é uma simplificação.
    console.log(`Buscando escolas no estado ${state} - lógica a ser implementada`);
    return [];
  }

  async findWithFilters(filters: SchoolFilters): Promise<{ data: School[], total: number }> {
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
          .orWhere('institutionName', 'ilike', `%${search}%`);
      });
      countQuery.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('institutionName', 'ilike', `%${search}%`);
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

  async toggleStatus(id: string): Promise<School | null> {
    try {
      const school = await this.findById(id);
      if (!school) {
        return null;
      }

      // Usando a propriedade deleted da entidade School
      const newDeletedStatus = !school.deleted;
      const updatedSchool = await this.update(parseInt(id), { deleted: newDeletedStatus } as UpdateSchoolData);
      
      return updatedSchool;
    } catch (error) {
      console.error('Erro ao alternar status da School:', error);
      throw error;
    }
  }
}