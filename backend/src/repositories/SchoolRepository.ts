import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
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
  private repository: Repository<School>;
  constructor() {
    super("schools");
    this.repository = AppDataSource.getRepository(School);
  }
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<School>> {
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
      console.error(`Erro ao buscar registros de escola:`, error);
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

  async findWithFilters(filters: SchoolFilters): Promise<PaginatedResult<School>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name' as keyof School,
      sortOrder = 'asc',
      search,
      ...otherFilters
    } = filters;

    try {
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

      return {
        data,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error(`Erro ao buscar escolas com filtros:`, error);
      throw error;
    }
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
